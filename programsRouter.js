const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

const { Program, User } = require('./models');

// user GET request to get user's programs
// router.get('/', (req, res) => {

// })

// when searching
router.get('/', (req, res) => {
    const filters = {};
    const queryableFields = ['id', 'programName', 'author', 'categories'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
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
        .then(program => res.json(program.serialize()))
});

// get specific day in a program
router.get('/:id/schedule/:schedule_id', (req, res) => {
    Program
        .findById(req.params.id)
        .select('schedule')
        .then(program => res.json(program.schedule[req.params.schedule_id]))
});

// get specific exercise within a day in a program 
router.get('/:id/schedule/:schedule_id/exercises/:exercise_id', (req, res) => {
    Program
        .findById(req.params.id)
        .select('schedule')
        .then(program => res.json(program.schedule[req.params.schedule_id].exercises[req.params.exercise_id]))
});

// used to edit programName, categories 
router.put('/:id', jsonParser, (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const catLength = req.body.categories.length;
    if (catLength === 0) {
        const message = 'Enter categories';
        console.error(message);
        return res.status(400).send(message);
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
    edited[attr] = req.body.name;

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

    const scheduleId = req.params.schedule_id;
    const exerciseId = req.params.exercise_id;
    const edited = {};

    const location = `schedule.${scheduleId}.exercises.${exerciseId}`;

    const editableFields = ['exercise', 'sets', 'reps', 'distance', 'unitLength', 'time', 'unitTime', 'comments'];
    editableFields.forEach(field => {
        let attr = `schedule.${scheduleId}.exercises.${exerciseId}.${field}`;
        if (field in req.body) {
            edited[attr] = req.body[field];
        }
        // else {
        //     edited[attr] = null;
        // }
    });
    
    // coll.update( {'_id':'2', 'users._id':'2'}, {$set:{'users.$':{ "_id":2,"name":"name6",... }}}, false, true)

    Program
        .findByIdAndUpdate(req.params.id, { $set: edited }, { new: true })
        .then((updatedPost) => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
});

router.delete('/:id', (req, res) => {
    // Find program in User's savedPrograms and delete 
    Program
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).json({ message: 'success' }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        })
});

router.post('/', jsonParser, jwtAuth, (req, res) => {
    // Author should be removed because this should be automatically added 
    const requiredFields = ['programName', 'categories', 'schedule'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    // confirms that categories has at leastlength of 1 
    const catLength = req.body.categories.length;
    if (catLength === 0) {
        const message = 'Enter categories';
        console.error(message);
        return res.status(400).send(message);
    }

    // confirms categories = legs, back, chest, biceps, triceps, shoulders, full body, cardio
    const acceptedCat = ['legs', 'back', 'chest', 'biceps', 'triceps', 'shoulders', 'full body', 'cardio'];
    // loop through input categories 
    req.body.categories.forEach(category => {
        if (!acceptedCat.includes(category.toLowerCase())) {
            const message = 'Invalid category';
            console.error(message);
            return res.status(400).send(message);
        }
    })

    // confirms that schedule has at least length of 1
    const schedLength = req.body.schedule.length;
    if (schedLength == 0) {
        const message = 'Schedule is empty';
        console.error(message);
        return res.status(400).send(message);
    };

    // if schedule is > 1, confirm that each day includes a name 
    // (programs that are only 1 day long don't need a name)
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

    // confirms each exercise has name, validates Units, and confirms #s
    for (let i = 0; i < schedLength; i++) {
        let exerciseList = req.body.schedule[i].exercises;
        for (let j = 0; j < exerciseList.length; j++) {
            if (!exerciseList[j].exercise) {
                const message = 'Exercise Name has not been added';
                console.error(message);
                return res.status(400).send(message);
            }

            const lengthUnits = ['m', 'km', 'mi', 'ft'];
            if (exerciseList[j].unitLength) {
                if (!lengthUnits.includes(exerciseList[j].unitLength.toLowerCase())) {
                    const message = 'Invalid unit of length';
                    console.error(message);
                    return res.status(400).send(message);
                }
            }

            const timeUnits = ['m', 'hr', 's'];
            if (exerciseList[j].unitTime) {
                if (!timeUnits.includes(exerciseList[j].unitTime.toLowerCase())) {
                    const message = 'Invalid unit of time';
                    console.error(message);
                    return res.status(400).send(message);
                }
            }

            // validates sets, reps, distance, and time are numbers

        }
    }

    Program
        .create({
            programName: req.body.programName,
            author: req.user.id,
            categories: req.body.categories,
            schedule: req.body.schedule
        })
        .then(program => res.json(program.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        })
});

module.exports = router;