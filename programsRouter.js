const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Program, Exercise } = require('./models');

router.get('/', (req, res) => {
    // const filters = {};
    // const queryableFields = ['programName', 'author', 'categories',];
    // queryableFields.forEach(field => {
    //     if (req.query[field]) {
    //         filters[field] = req.query[field];
    //     }
    // });
    Program
        // .find(filters)
        .find()
        .then(programs => {
            res.json({
                programs: programs.map(program => program.serialize())
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
})

router.delete('/:id', (req, res) => {
    Program
        .findByIdAndRemove(req.params.id)
        .then(() => res.status(204).json({ message: 'success' }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        })
})

router.put('/:id', (req, res) => {
    // confirm schedule has length and has exercises (i.e schedule.exercises)
    // if exercise is being updated
    // find exercise (by name?) and update that entry
})

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['programName', 'author', 'categories', 'schedule'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    // confirms that schedule is has at least length of 1
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

    // confirms each exercise has name  
    for (let i = 0; i < schedLength; i++) {
        let exerciseList = req.body.schedule[i].exercises;
        for (let j = 0; j < exerciseList.length; j++) {
            if (!exerciseList[j].exercise) {
                const message = 'Exercise Name has not been added';
                console.error(message);
                return res.status(400).send(message);
            }
        }
    }

    // Author will come from Authentication 
    // User
    //   .findOne()
    //   .then(user => {
    //     Program
    //       .create({
    //         programName: req.body.programName,
    //         author: user._id,
    //         categories: req.body.categories,
    //         schedule: scheduleWithIds
    //       });
    //   });

    // ***********
    // Create Program 
    // Program
    //     .create({
    //         programName: req.body.programName,
    //         author: req.body.author,
    //         categories: req.body.categories,
    //         schedule: scheduleWithIds
    //     })



    // iterate over req.body.schedule.exercises array 
    // Find ID in the array 
    // If ID is NOT in Exercises and then create Exercise 
    // THEN return Exercises 
    // 


})

module.exports = router;