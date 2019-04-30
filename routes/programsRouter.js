const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

const { Program, User } = require('../models');

// when searching
router.get('/', jwtAuth, (req, res) => {
    const filters = {};
    const queryableFields = ['id', 'programName', 'author', 'categories'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = new RegExp(req.query[field], 'i');
        }
    });

    Program
        .find(filters)
        .then(programs => {
            res.json(programs.map(program => program.serialize()))
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.get('/:id', (req, res) => {
    Program
        .findById(req.params.id)
        .then(program => program.populate('author').populate('schedule.exercises.exercise').execPopulate())
        .then(program => {
            res.json(program.serialize())
        })
});

router.post('/', jwtAuth, jsonParser, (req, res) => {
    const requiredFields = ['programName', 'categories', 'schedule'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    const catLength = req.body.categories.length;
    if (catLength === 0) {
        const message = 'Enter categories';
        console.error(message);
        return res.status(400).send(message);
    }

    const acceptedCat = ['legs', 'back', 'chest', 'biceps', 'triceps', 'shoulders', 'full body', 'cardio'];
    // loop through input categories 
    req.body.categories.forEach(category => {
        if (!acceptedCat.includes(category.toLowerCase())) {
            const message = 'Invalid category';
            console.error(message);
            return res.status(400).send(message);
        }
    })

    const schedLength = req.body.schedule.length;
    if (schedLength == 0) {
        const message = 'Schedule is empty';
        console.error(message);
        return res.status(400).send(message);
    };

    if (schedLength > 1) {
        for (let i = 0; i < schedLength; i++) {
            let day = req.body.schedule[i];
            if (!day.name) {
                const message = 'Name has not been added';
                console.error(message);
                return res.status(400).send(message);
            }
        }
    }

    for (let i = 0; i < schedLength; i++) {
        let exerciseList = req.body.schedule[i].exercises;
        for (let j = 0; j < exerciseList.length; j++) {
            if (!exerciseList[j].exercise) {
                const message = 'Exercise Name has not been added';
                console.error(message);
                return res.status(400).send(message);
            }

            const validTypes = ['sets & reps', 'reps & time', 'reps & distance', 'distance & time', 'reps', 'distance', 'time'];
            if (exerciseList[j].type) {
                if (!validTypes.includes(exerciseList[j].type)) {
                    const message = 'Invalid Type of Exercise';
                    console.error(message);
                    return res.status(400).send(message);
                }
            }

            const lengthUnits = ['m', 'km', 'mi', 'ft'];
            if (exerciseList[j].unitLength) {
                if (!lengthUnits.includes(exerciseList[j].unitLength.toLowerCase())) {
                    const message = 'Invalid unit of length';
                    console.error(message);
                    return res.status(400).send(message);
                }
            }

            const timeUnits = ['min', 'hr', 's'];
            if (exerciseList[j].unitTime) {
                if (!timeUnits.includes(exerciseList[j].unitTime.toLowerCase())) {
                    const message = 'Invalid unit of time';
                    console.error(message);
                    return res.status(400).send(message);
                }
            }
        }
    }

    Program
        .create({
            programName: req.body.programName,
            author: req.user.id,
            categories: req.body.categories,
            schedule: req.body.schedule
        })
        .then(program => program.populate('author').execPopulate())
        .then(program => res.status(201).json(program.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        })
});

// used to edit programName, categories 
router.put('/:id', jwtAuth, jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    if (req.body.categories) {
        const catLength = req.body.categories.length;
        if (catLength === 0) {
            const message = 'Enter categories';
            console.error(message);
            return res.status(400).send(message);
        }
    }
    
    const edited = {};
    const editableFields = ['programName', 'categories']
    editableFields.forEach(field => {
        if (field in req.body) {
            edited[field] = req.body[field];
        }
    });

    Program
        .findByIdAndUpdate(req.params.id, { $set: edited }, { new: true })
        .then((updatedPost) => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
});

// used to edit Name of Day in workout 
router.put('/:id/schedule/:schedule_id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const scheduleId = req.params.schedule_id;
    const attr = `schedule.${scheduleId}.name`;
    const edited = {};
    edited[attr] = req.body.name.trim();

    Program
        .findByIdAndUpdate(req.params.id, { $set: edited }, { new: true })
        .then((updatedPost) => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
});

// used to EXERCISES (plus sets/reps, etc)
// Also DELETE exercises or add
router.put('/:id/schedule/:schedule_id/exercises/:exercise_id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    if (!(req.body.exercise)) {
        res.status(400).json({
            error: 'Request must include exercise id'
        });
    }

    const scheduleId = req.params.schedule_id;
    const exerciseId = req.params.exercise_id;
    const location = `schedule.${scheduleId}.exercises.${exerciseId}`;

    const reqObj = {};
    const editableFields = ['exercise', 'sets', 'reps', 'distance', 'unitLength', 'time', 'unitTime', 'comments', 'type'];

    editableFields.forEach(field => {
        if (field in req.body) {
            reqObj[field] = req.body[field];
        }
    });

    const namedObj = {};
    namedObj[location.toString()] = reqObj;

    Program
        .findByIdAndUpdate(req.params.id, namedObj)
        .then(res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
});

router.delete('/:id', jwtAuth, (req, res) => {
    User
        .update(
            {},
            { $pull: { savedPrograms: req.params.id } },
            { multi: true }
        )
        .then(
            Program
                .findByIdAndRemove(req.params.id)
                .then(() => res.status(204).json({ message: 'success' }))
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                })
        )
});

module.exports = router;