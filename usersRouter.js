const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { User } = require('./models');

router.get('/', (req, res) => {
    User
        .find()
        .then(users => {
            res.json({
                users: users.map(user => user.serialize())
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

router.get('/:id', (req, res) => {
    User
        .findById(req.params.id)
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    for (let i = 0; i <= requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    User
        .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
        })
        .then(user => res.status(201).json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
});

module.exports = router;