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

// Programs that the user has written 
userSchema.virtual('userPrograms', {
    ref: 'Program',
    localField: '_id',
    foreignField: 'author'
  });

// leaves out PW
userSchema.methods.serialize = function () {
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
            exercises: 
                [
                    {
                        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
                        sets: { type: Number, required: false },
                        reps: { type: Number, required: false },
                        distance: { type: Number, required: false },
                        unitLength: { type: 'string', required: false },
                        time: { type: Number, required: false },
                        unitTime: { type: 'string', required: false },
                        comments: { type: 'string', required: false }
                    }
                ]
        }
    ]
});

// programSchema.pre('findByIdAndRemove', function(next) {
//     this.model('User').remove({ userPrograms: this._id }, next);
//     this.model('User').remove({ savedPrograms: this._id }, next);
// });

programSchema.pre('find', function (next) {
    this.populate('author');
    this.populate('schedule.exercises.exercise');
    next();
});

programSchema.virtual('authorUserName').get(function () {
    return this.author.userName;
});

programSchema.methods.serialize = function () {
    return {
        id: this._id,
        programName: this.programName,
        author: this.authorUserName,
        categories: this.categories,
        schedule: this.schedule
    }
}

const exerciseSchema = mongoose.Schema({
    name: { type: 'string', required: true }
});

const User = mongoose.model('User', userSchema);
const Program = mongoose.model('Program', programSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = { User, Program, Exercise };