const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

const { Exercise } = require('./models');

// when a user creates a program, they'll need to GET all the Exercises for the Autocomplete section
router.get('/', (req, res) => {
    const filters = {};
    const queryableFields = ['id', 'name'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });

    Exercise
        .find(filters)
        .then(exercises => {
            res.json(exercises.map(exercise => exercise.serialize()))
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

// When user decides to create a new exercise, name and id provided
router.post('/', jwtAuth, jsonParser, (req, res) => {
    Exercise
        .find ({ name: req.body.name.trim() })
        .then(list => {
            if (list.length > 0) {
                console.log('list: ', list)
                res.status(200).json({ name: list.name, id: list.id})
            }
            else {
                Exercise
                .create({ name: req.body.name.trim() })
                .then(exercise => {
                    const id = exercise._id.toString();
                    const name = exercise.name;
                    res.status(201).json({ name: name, id: id})
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
            }
        })
})

router.post('/list', jwtAuth, jsonParser, (req, res) => {
    Exercise
        .find({ name: new RegExp(req.body.name, 'i')})
        .sort({ name: 1 })
        .then(data => res.json(data))
})

module.exports = router;