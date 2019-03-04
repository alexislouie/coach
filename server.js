"use strict";
require('dotenv').config();
const express = require("express");
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const userRouter = require('./usersRouter');
const programsRouter = require('./programsRouter');
const exercisesRouter = require('./exercisesRouter');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const app = express();

if (require.main === module) {
  app.use(morgan('common'));
}

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.static("public"));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });

app.use('/users', userRouter);
app.use('/programs', programsRouter);
app.use('/exercises', exercisesRouter);
app.use('/auth', authRouter)

app.patch('/test', require('body-parser').json(), (req, res) => {
  console.log(req);
  res.json(req.body)
})

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    // mongoose.set('useFindAndModify', false);
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

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };