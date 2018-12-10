const mongoose = require('mongoose');
mongoose.Promise = global.Promise; 

const userSchema = mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    userName: {
        type: 'string',
        unique: true
    },
    // userPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
    // savedPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }]
});

// leaves out PW
userSchema.methods.serialize = function() {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName
    };
};

const programSchema = mongoose.Schema({
    programName: 'string',
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    categories: ['string'],
    schedule: [
        {
            name: { type: 'string', required: false }, // optional in case user is just submitting a single routine
            exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
        }
    ]
});

const exerciseSchema = mongoose.Schema({
    name: { type: 'string', required: true },
    sets: { type: Number, required: false },
    reps: { type: Number, required: false },
    distance: { type: Number, required: false }, 
    unitLength: { type: 'string', required: false },
    time: { type: Number, required: false },
    unitTime: { type: 'string', required: false },
    comments: { type: 'string', required: false }
});

const User = mongoose.model('User', userSchema);
const Program = mongoose.model('Program', programSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = { User, Program, Exercise};