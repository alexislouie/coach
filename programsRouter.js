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
router.put('/:id', (req, res) => {
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
      .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
      .then((updatedPost) => res.status(204).end())
      .catch(err => res.status(500).json({ message: 'Internal Server Error' }));
});

router.put('/:id/schedule/:schedule_id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const reqFields = ['exercises']
    Program
        .findById(req.params.id)
    // .then(program => )
})

router.delete('/:id', (req, res) => {
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

router.put('/:id', (req, res) => {
    const requiredFields = ['programName', 'categories', 'schedule'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

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
        }
    }
    const updated = {};
    const updateableFields = ['programName', 'categories', 'schedule'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    Program
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Something went wrong' }));


    // Find Program in collections and Update it
    // Don't have to include author because you can't change the author 
    Program
        .findByIdAndUpdate();
    //${set}
    // .updateOne({_id: programId, {$set: {'schedule.day': req.body.schedule[i].exercise[9]}}})

});

module.exports = router;