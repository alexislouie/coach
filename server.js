"use strict";
const express = require("express");
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { User, Program, Exercise } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.static("public"));

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

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

module.exports = app;