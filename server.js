"use strict";
const express = require("express");
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const { User, Program, Exercise } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.static("public"));

app.get('/users', (req, res) => {
  User
    .find()
    .then(users => {
      res.json(users.map(user => {
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName
        }
      }))
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error'});
    });
})
 
// app.get('/users', (req, res) => {
//   User
//     .find()
//     .then(users => {
//       res.json({
//         users: users.map(user => user.serialize())
//       })
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error'});
//     });
// })

// app.get('/programs', (req, res) => {
//   Program
//     .find()
//     .then(programs => {
//       res.json(programs.map(program => {
//         return {
//           id: program._id,
//           programName: program.programName,
//           author: program.author,
//           categories: program.categories,
//           schedule: program.schedule
//         }
//       }));
//     })
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     });
// });

// app.delete('/program/:id', (req, res) => {
//   Program
//     .findByIdAndRemove(req.params.id)
//     .then(() => {
//       console.log(`Deleted program with id \`${req.params.id}\``);
//       res.status(204).end();
//     })
// })

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if (require.main === module) {
//   app.listen(process.env.PORT || 8080, function () {
//     console.info(`App listening on ${this.address().port}`);
//   });
// }

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };