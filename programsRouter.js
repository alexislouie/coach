const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Program, Exercise } = require('./models');

router.get('/', (req, res) => {
    // const filters = {};
    // const queryableFields = ['title', 'author', 'categories',];
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

    // Create documents for any exercises that aren't already in Exercise Collection
    // req.body.schedule.forEach(day => {
    //     day.exercises.forEach(exercise => {
    //         const exerciseName = exercise.exercise;
    //         Exercise
    //             .find({ name: exerciseName }).count()
    //             .then(count => {
    //                 if (count == 0) {
    //                     Exercise.create({ name: exerciseName })
    //                 }
    //             })
    //             .catch(err => {
    //                 console.error(err);
    //                 res.status(500).json({ error: 'Internal Server Error' })
    //             })
    //     })
    // })

    // Creates documents for any exercises that aren't already in Exercise Collection
    // Replaces Exercise Name with Exercise IDs in the Schedule
    const scheduleWithIds = req.body.schedule; 
    scheduleWithIds.forEach(day => {
        day.exercises.forEach(exercise => {
            const exerciseName = exercise.exercise;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
            Exercise
                .find({ name: exerciseName }).count()
                .then(count => {
                    if (count == 0) {
                        Exercise.create({ name: exerciseName })
                    }
                })
                .then(() => Exercise.findOne({ name: exerciseName }, { _id: 1 })._id)
                .then((id) => exercise.exerise = id)
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' })
                })
        })
    })
    res.send(scheduleWithIds);

    // Same as above, but as a for loop
    // const scheduleWithIds = req.body.schedule; 
    // for (let i = 0; i < scheduleWithIds.length; i++ ) {
    //     for (let j = 0; j < scheduleWithIds[i].exercises.length; j++ ) {
    //         const exerciseName = scheduleWithIds[i].exercises[j]
    //         Exercise
    //             .find({ name: exerciseName }).count()
    //             .then(count => {
    //                 if (count == 0) {
    //                     Exercise.create({ name: exerciseName })
    //                 }
    //             })
    //             .then(() => Exercise.findOne({ name: exerciseName }, { _id: 1 })._id)
    //             .then(id => scheduleWithIds[i].exercises[j].exercise = id)
    //             .catch(err => {
    //                 console.error(err);
    //                 res.status(500).json({ error: 'Internal Server Error' })
    //             })
    //     }
    // }
    


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