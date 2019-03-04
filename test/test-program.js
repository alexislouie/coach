'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const expect = chai.expect;

const { Program, User, Exercise } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

const authenticatedUser = chai.request.agent(app);
let userId;
let token;

function seedProgramData(user, exercise) {
    console.info('seeding program data');
    const seedData = [];

    for (let i = 0; i < 2; i++) {
        seedData.push(generateProgramData(user, exercise));
    }

    return Program.insertMany(seedData)
}

function seedExercise() {
    return Exercise.create({
        name: faker.lorem.words()
    })
}

function seedAuthor() {
    return User.create({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: 'seededUser',
        password: 'password'
    })
}

function generateProgramData(user, exercise) {
    return {
        programName: faker.lorem.words(),
        author: mongoose.Types.ObjectId(user._id),
        categories: ['legs', 'back', 'chest', 'biceps', 'triceps', 'shoulders', 'full body', 'cardio'],
        schedule: [
            {
                name: faker.lorem.words(),
                exercises: [
                    {
                        exercise: mongoose.Types.ObjectId(exercise._id),
                        type: 'sets & reps',
                        sets: faker.random.number(),
                        reps: faker.random.number(),
                    }
                ]
            }
        ]
    }
}

function tearDownDb() {
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}

describe('Program API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        // sets up authentication (before each test runs, create a user and authenticate them)
        return chai.request(app)
            .post('/users/register')
            .send({
                firstName: 'test',
                lastName: 'user',
                userName: 'authuser',
                password: 'password'
            })
            .then(res => {
                // console.log(res.body)
                expect(res).to.have.status(201);
                // console.log('Registered user for Authentication: ', res.body)
            })
            .then(() => {
                return User
                    .findOne()
                    .then(user => {
                        userId = user.id;
                        // console.log('userId global set to current user: ', userId)
                        const userCredentials = {
                            username: 'authuser',
                            password: 'password'
                        };

                        return userCredentials;
                    })
                    .then(userCredentials => {
                        // console.log('posting credentials: ', userCredentials)
                        return authenticatedUser
                            .post('/auth/login')
                            .send(userCredentials)
                            .then(res => {
                                token = res.body.authToken;
                                //console.log('token set to: ', token);
                                return token;
                            });
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err));
    })


    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {

        it('should return all existing programs', function () {
            return seedExercise()
                .then(exercise => {
                    console.log('seeding exercise')
                    return seedAuthor()
                        .then(author => ({ exercise, author }))
                })
                .then(({ exercise, author }) => seedProgramData(author, exercise))
                .then(() => {
                    let res;
                    return chai.request(app)
                        .get('/programs')
                        .set('Authorization', `Bearer ${token}`)
                        .then(_res => {
                            res = _res
                            expect(res).to.have.status(200);
                            expect(res.body).to.have.lengthOf.at.least(1);

                            return Program.count();
                        })
                        .then(count => {
                            expect(res.body).to.have.lengthOf(count);
                        })
                })
        })

        it('should return programs with the right fields', function () {
            let resProgram;
            return seedExercise()
                .then(exercise => {
                    console.log('seeding exercise')
                    return seedAuthor()
                        .then(author => ({ exercise, author }))
                })
                .then(({ exercise, author }) => seedProgramData(author, exercise))
                .then(() => {
                    return chai.request(app)
                        .get('/programs')
                        .set('Authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('array');
                            expect(res.body).to.have.lengthOf.at.least(1);

                            res.body.forEach(program => {
                                expect(program).to.be.an('object');
                                expect(program).to.include.keys('id', 'programName', 'author', 'categories', 'schedule');
                                expect(program.schedule).to.have.lengthOf.at.least(1);
                            });

                            resProgram = res.body[0];
                            return Program.findById(resProgram.id)
                        })
                        .then(program => {
                            //console.log('program: ', program)
                            expect(resProgram.programName).to.equal(program.programName);
                            User
                                .findById(program.author)
                                .then(author => expect(resProgram.author).to.equal(author.userName));
                            expect(resProgram.categories).to.deep.equal(program.categories);

                            const exerciseIds = [];
                            program.schedule.forEach(day => {
                                day.exercises.forEach(exercise => {
                                    exerciseIds.push(exercise.exercise.toString())
                                });
                            })

                            return exerciseIds
                        })
                        .then(exerciseIds => {
                            const resProgramIds = [];
                            resProgram.schedule.forEach(day => {
                                day.exercises.forEach(exercise => resProgramIds.push(exercise.exercise._id));
                            })
                            expect(exerciseIds).to.deep.equal(resProgramIds);
                        });
                })
        });
    })

    describe('POST endpoint', function () {
        it('should add a new program', function () {

            return seedExercise()
                .then(() => {
                    return Exercise
                        .findOne()
                        .then(exercise => {
                            // console.log('USER ID IN POST TEST: ', userId)
                            const newProgram = {
                                programName: faker.lorem.words(),
                                author: userId,
                                categories: ['legs', 'back', 'chest'],
                                schedule: [
                                    {
                                        name: faker.lorem.words(),
                                        exercises: [
                                            {
                                                exercise: mongoose.Types.ObjectId(exercise._id),
                                                type: 'sets & reps',
                                                sets: faker.random.number(),
                                                reps: faker.random.number(),
                                            },
                                            {
                                                exercise: mongoose.Types.ObjectId(exercise._id),
                                                type: 'distance & time',
                                                distance: faker.random.number(),
                                                time: faker.random.number(),
                                            }
                                        ]
                                    }
                                ]
                            }

                            return newProgram
                        })
                        .then(newProgram => {
                            return chai.request(app)
                                .post('/programs')
                                .set('Authorization', `Bearer ${token}`)
                                .send(newProgram)
                                .then(res => {
                                    newProgram.id = res.body.id;
                                    expect(res).to.have.status(201);
                                    expect(res).to.be.json;
                                    expect(res.body).to.be.an('object');
                                    // expect(res.body).to.include.keys(
                                    //     'id', 'programName', 'categories', 'schedule');
                                    expect(res.body.id).to.not.be.null;
                                    expect(res.body.programName).to.equal(newProgram.programName);
                                    expect(res.body.categories).to.deep.equal(newProgram.categories);

                                    const day = newProgram.schedule;
                                    for (let i = 0; i < day.length; i++) {
                                        newProgram.schedule[i]._id = res.body.schedule[i]._id;
                                        for (let j = 0; j < day[i].exercises.length; j++) {
                                            newProgram.schedule[i].exercises[j]._id = res.body.schedule[i].exercises[j]._id;
                                        }
                                    }
                                    // console.log('res.body in test-program: ', res.body)
                                    expect(res.body.schedule.name).to.equal(newProgram.schedule.name)
                                    // expect(({name, exercises} = res.body.schedule)).to.deep.equal(({name, exercises} = newProgram.schedule))
                                    // expect(res.body.schedule).to.deep.equal(newProgram.schedule);

                                    User
                                        .findById(newProgram.author)
                                        .then(user => {
                                            return user.userName
                                        })
                                        .then(userName => {
                                            expect(res.body.author).to.equal(userName);
                                        })
                                });
                        })
                })

        });
    });

    describe('PUT endpoint', function () {

        let programId;
        this.beforeEach(function () {
            return seedExercise()
                .then(() => {
                    return Exercise
                        .findOne()
                        .then(exercise => {
                            const newProgram = {
                                programName: faker.lorem.words(),
                                author: userId,
                                categories: ['legs', 'back', 'chest'],
                                schedule: [
                                    {
                                        name: faker.lorem.words(),
                                        exercises: [
                                            {
                                                exercise: mongoose.Types.ObjectId(exercise._id),
                                                type: 'sets & reps',
                                                sets: faker.random.number(),
                                                reps: faker.random.number(),
                                            },
                                            {
                                                exercise: mongoose.Types.ObjectId(exercise._id),
                                                type: 'distance & time',
                                                distance: faker.random.number(),
                                                time: faker.random.number(),
                                            }
                                        ]
                                    }
                                ]
                            }
                            return newProgram
                        })
                        .then(newProgram => {
                            return chai.request(app)
                                .post('/programs')
                                .set('Authorization', `Bearer ${token}`)
                                .send(newProgram)
                                .then(res => {
                                    expect(res).to.have.status(201)
                                    programId = res.body.id
                                })
                        })
                })
        });

        it('should update program name', function () {
            return Program
                .findById(programId)
                .then(doc => {
                    const update = {
                        id: doc._id,
                        programName: 'new program name'
                    }

                    return chai.request(app)
                        .put(`/programs/${programId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .send(update)
                        .then(res => {
                            expect(res).to.have.status(204)
                            return Program.findById(programId)
                        })
                        .then((program) => {
                            expect(program.programName).to.equal(update.programName);

                        })
                })
                .catch(err => console.log(err))
        });

        it('should update program categories', function () {
            return Program
                .findById(programId)
                .then(doc => {
                    const update = {
                        id: doc._id,
                        categories: ['full body', 'cardio']
                    }

                    return chai.request(app)
                        .put(`/programs/${programId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .send(update)
                        .then(res => {
                            expect(res).to.have.status(204)
                            return Program.findById(programId)
                        })
                        .then((program) => {
                            expect(program.categories).to.deep.equal(update.categories);

                        })
                })
                .catch(err => console.log(err))
        });

        it('should update the name of the day in a workout', function () {
            return Program
                .findById(programId)
                .then(doc => {
                    const update = {
                        id: doc._id,
                        name: 'updated name'
                    }

                    return chai.request(app)
                        .put(`/programs/${programId}/schedule/0`)
                        .set('Authorization', `Bearer ${token}`)
                        .send(update)
                        .then(res => {
                            expect(res).to.have.status(204)
                            return Program.findById(programId)
                        })
                        .then((program) => {
                            expect(program.schedule[0].name).to.equal(update.name);
                        })
                })
                .catch(err => console.log(err))
        });

        it('should update exercise', function () {
            return Program
                .findById(programId)
                .then(doc => {
                    const update = {
                        id: doc._id,
                        exercise: doc.schedule[0].exercises[0].exercise._id,
                        reps: 8,
                        distance: 200,
                        unitLength: 'm'
                    }

                    return chai.request(app)
                        .put(`/programs/${programId}/schedule/0/exercises/0`)
                        .set('Authorization', `Bearer ${token}`)
                        .send(update)
                        .then(res => {
                            expect(res).to.have.status(204)
                            return Program.findById(programId)
                        })
                        .then((program) => {
                            expect(program.schedule[0].exercises[0].exercise).to.deep.equal(update.exercise);
                            expect(program.schedule[0].exercises[0].reps).to.equal(update.reps);
                            expect(program.schedule[0].exercises[0].distance).to.equal(update.distance);
                            expect(program.schedule[0].exercises[0].unitLength).to.equal(update.unitLength);
                        })
                })
                .catch(err => console.log(err))
        });

    });

    describe('DELETE endpoint', function () {
        it('should remove a program', function () {
            let programId;
            return seedExercise()
                .then(() => {
                    return Exercise
                        .findOne()
                        .then(exercise => {
                            const newProgram = {
                                programName: faker.lorem.words(),
                                author: userId,
                                categories: ['legs', 'back', 'chest'],
                                schedule: [
                                    {
                                        name: faker.lorem.words(),
                                        exercises: [
                                            {
                                                exercise: mongoose.Types.ObjectId(exercise._id),
                                                type: 'sets & reps',
                                                sets: faker.random.number(),
                                                reps: faker.random.number(),
                                            },
                                            {
                                                exercise: mongoose.Types.ObjectId(exercise._id),
                                                type: 'distance & time',
                                                distance: faker.random.number(),
                                                time: faker.random.number(),
                                            }
                                        ]
                                    }
                                ]
                            }
                            return newProgram;
                        })
                        .then(newProgram => {
                            return chai.request(app)
                                .post('/programs')
                                .set('Authorization', `Bearer ${token}`)
                                .send(newProgram)
                                .then(res => {
                                    expect(res).to.have.status(201);
                                    programId = res.body.id;
                                })
                        })
                        .then(() => {
                            return chai.request(app)
                                .del(`/programs/${programId}`)
                                .set('Authorization', `Bearer ${token}`)
                                .then(res => {
                                    expect(res).to.have.status(204);
                                    return Program.findById(programId)
                                })
                                .then(program => {
                                    expect(program).to.not.exist;
                                })
                        })
                })
        });
    });
})