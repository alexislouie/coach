const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const { User } = require('./models');

const router = express.Router();
const jsonParser = bodyParser.json();

// Middleware for Authentication
const jwtAuth = passport.authenticate('jwt', { session: false });


router.get('/', jwtAuth, (req, res) => {
    User
        .find()
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

// will have to include users' programs/the program virtual I created before
// this is now protected by jwtAuth
router.get('/:id', (req, res) => {
    User
        .findById(req.params.id)
        .populate('userProgramsVirtual')
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.post('/register', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['firstName', 'lastName', 'userName', 'password'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    const trimmedFields = ['userName', 'password'];
    const notTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
    if (notTrimmedFields) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: notTrimmedFields
        })
    }

    const fieldSizes = {
        userName: {
            min: 3, 
            max: 10
        },
        password: {
            min: 8,
            max: 72
        }
    };
    const tooSmallField = Object.keys(fieldSizes).find(
        field => 
            'min' in fieldSizes[field] && req.body[field].trim().length < fieldSizes[field].min
    );
    const tooLargeField = Object.keys(fieldSizes).find(
        field => 
            'max' in fieldSizes[field] && req.body[field].trim().length > fieldSizes[field].max
    );
    if (tooSmallField || tooLargeField) {
        res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
            ? `Must be at least ${fieldSizes[tooSmallField]
              .min} characters long`
            : `Must be at most ${fieldSizes[tooLargeField]
              .max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {userName, password, firstName = '', lastName = ''} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User
        .find({userName: userName})
        .count()
        .then(count => {
            if (count > 0) {
                // why is this Promise.reject and not res.status(422).json?
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                  });
            }
            return User.hashPassword(password);
        })
        .then(hash => { 
            return User
                .create({
                    firstName,
                    lastName,
                    userName,
                    password: hash
                });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: 'Internal Server Error' });
        });
});

// req looks like: { "op": "update", "path": "savedPrograms", "value": "5c2a679abd6ad21ec65e2768" }
router.patch('/:id', jsonParser, (req, res) => {

    if (req.body.path === 'savedPrograms' ) {
        if (req.body.op === 'update') {
            User
                .update(
                    { _id: req.params.id}, 
                    { $push: { savedPrograms: req.body.value} }
                )
                .then((updatedUser) => res.status(204).end())
                .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
        }
        // removes savedPrograms
        if (req.body.op === 'delete') {
            User 
                .find({_id: req.params.id})
                .then(user => {
                    const index = user.savedPrograms.indexOf(req.body.value);
                    savedPrograms.splice(index, 1)
                })
        }
    }

})



module.exports = router;