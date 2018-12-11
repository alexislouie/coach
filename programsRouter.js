const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Program } = require('./models');

router.get('/', (req, res) => {
    Program
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

// router.post('/', (req, res) => {
//     const requiredFields = ['programName', 'author', 'categories', 'schedule'];
//     for (let i = 0; i <= requiredFields.length; i++) {
//         const field = requiredFields[i];
//         if (!(field in req.body)) {
//             const message = `Missing \`${field}\` in request body`;
//             console.error(message);
//             return res.status(400).send(message);
//         }
//     }

// })

// FOR CREATING PROGRAM  
// User
//   .findOne()
//   .then(user => {
//     Program
//       .create({
//         programName: req.body.programName,
//         author: user._id
//       });
//   });

module.exports = router;