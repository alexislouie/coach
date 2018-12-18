const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Exercise } = require('./models');

// when a user creates a program, they'll need to GET all the Exercises for the Autocomplete section
router.get('/', (req, res) => {
    Exercise
        .find()
        .then(exercises => {
            res.json({
                exercises: exercises.map(exercise => exercise.serialize())
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

// When user decides to create a new exercise, name and id provided
router.post('/', jsonParser, (req, res) => {
    Exercise
        .create({ name: req.body.name })
        .then(exercise => {
            const id = exercise._id.toString();
            const name = exercise.name;
            res.status(200).json({ name: name, id: id})
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

module.exports = router;