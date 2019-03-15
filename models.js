const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    firstName: {
        type: 'string',
        required: true
    },
    lastName: {
        type: 'string',
        required: true
    },
    userName: {
        type: 'string',
        required: true,
        unique: true
    },
    password: {
        type: 'string',
        required: true
    },
    savedPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }});

userSchema.virtual('userProgramsVirtual', {
    ref: 'Program',
    localField: '_id',
    foreignField: 'author'
});

userSchema.methods.serialize = function () {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName,
        userPrograms: this.userProgramsVirtual,
        savedPrograms: this.savedPrograms
    };
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const workoutPlanSchema = mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  type: { type: String, required: true },
  sets: { type: Number, required: false },
  reps: { type: Number, required: false },
  distance: { type: Number, required: false },
  unitLength: { type: 'string', required: false },
  time: { type: Number, required: false },
  unitTime: { type: 'string', required: false },
  comments: { type: 'string', required: false }
})

const scheduleSchema = mongoose.Schema({
  name: { type: 'string', required: false },
  exercises: [ workoutPlanSchema ]
})

const programSchema = mongoose.Schema({
    programName: 'string',
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    categories: ['string'],
    schedule: [ scheduleSchema ]
});

programSchema.pre('find', function (next) {
    console.log('populating author and exercises in pre find');
    this.populate('author');
    this.populate('schedule.exercises.exercise');
    next();
});

programSchema.methods.serialize = function () {
    return {
        id: this._id,
        programName: this.programName,
        author: this.author.userName,
        categories: this.categories,
        schedule: this.schedule
    }
}

const exerciseSchema = mongoose.Schema({
    name: { type: 'string', required: true }
});

exerciseSchema.methods.serialize = function () {
    return {
        id: this._id,
        name: this.name
    }
}

const User = mongoose.model('User', userSchema);
const Program = mongoose.model('Program', programSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = { User, Program, Exercise };