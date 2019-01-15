'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const expect = chai.expect;

const { User, Exercise, Program } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

const authenticatedUser = chai.request.agent(app);
let token;

function seedProgramData(user, exercise) {
    console.info('seeding program data');
    const seedData = [];

    for (let i = 1; i <= 2; i++) {
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
        userName: faker.internet.userName(),
        password: faker.lorem.word() + '12345678',
        //savedPrograms: []
    })
}

function generateProgramData(user, exercise) {
    return {
        programName: faker.lorem.words(),
        author: mongoose.Types.ObjectId(user._id),
        categories: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
        schedule: [
            {
                name: faker.lorem.words(),
                exercises: [
                    {
                        exercise: mongoose.Types.ObjectId(exercise._id),
                        sets: faker.random.number(),
                        reps: faker.random.number(),
                    },
                    {
                        exercise: mongoose.Types.ObjectId(exercise._id),
                        distance: faker.random.number(),
                        time: faker.random.number(),
                    },
                    {
                        exercise: mongoose.Types.ObjectId(exercise._id),
                        sets: faker.random.number(),
                        time: faker.random.number(),
                    },
                ]
            }
        ]
    }
}

function seedUserData() {
    console.info('seeding user data');
    const seedData = [];

    for (let i = 1; i <= 2; i++) {
        seedData.push(generateUserData());
    }
    return User.insertMany(seedData);
}

function generateUserData() {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.internet.userName(),
        password: faker.lorem.word() + '12345678',
        //savedPrograms: []
    }
}

function tearDownDb() {
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}

describe.only('User API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return chai.request(app)
            .post('/users/register')
            .send({
                firstName: 'test',
                lastName: 'user',
                userName: 'authuser',
                password: 'password'
            })
            .then(res => {
                expect(res).to.have.status(201);

                const userCredentials = {
                    username: 'authuser',
                    password: 'password'
                };

                return userCredentials;
            })
            .then(userCredentials => {
                return authenticatedUser
                    .post('/auth/login')
                    .send(userCredentials)
                    .then(res => {
                        token = res.body.authToken;
                        return token;
                    });
            })
            .catch(err => console.log(err))
            .then(() => {
                return seedExercise()
                    .then(exercise => {
                        return seedAuthor()
                            .then(author => ({ exercise, author }))
                    })
                    .then(({ exercise, author }) => seedProgramData(author, exercise))
                    .then(() => seedUserData())
                    .catch(err => console.log(err));
            })
    })

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {
        it('should return user by ID with the right fields', function () {
            let resUser;

            return User
                .findOne()
                .then(user => {
                    return chai.request(app)
                        .get(`/users/${user.id}`)
                        .set('Authorization', `Bearer ${token}`)
                        .then(res => {
                            expect(res).to.have.status(200);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.include.keys('id', 'firstName', 'lastName', 'userName', 'savedPrograms')

                            resUser = res.body;
                            return User.findById(resUser.id)
                        })
                        .then(user => {
                            expect(resUser.firstName).to.equal(user.firstName);
                            expect(resUser.lastName).to.equal(user.lastName);
                            expect(resUser.userName).to.equal(user.userName);
                        });
                })
                .catch(err => console.log(err));
        });
    })

    describe('POST endpoint', function () {
        it('should add a new user', function () {
            const newUser = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                userName: faker.internet.userName(),
                password: faker.lorem.word() + '12345678',
            };

            return chai.request(app)
                .post('/users/register')
                .send(newUser)
                .then(function (res) {
                    if (newUser.userName.length > 15) {
                        expect(res).to.have.status(422)
                    }
                    else {
                        expect(res).to.have.status(201);
                        expect(res).to.be.json;
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.include.keys(
                            'id', 'firstName', 'lastName', 'userName', 'savedPrograms');
                        expect(res.body.id).to.not.be.null;
                        expect(res.body.firstName).to.equal(newUser.firstName);
                        expect(res.body.lastName).to.equal(newUser.lastName);
                        expect(res.body.userName).to.equal(newUser.userName);

                        return User.findById(res.body.id);
                    }

                })
                .then(function (user) {
                    expect(user.firstName).to.equal(newUser.firstName);
                    expect(user.lastName).to.equal(newUser.lastName);
                    expect(user.userName).to.equal(newUser.userName);
                })
                .catch(err => console.log(err));
        });
    });

    describe('PATCH endpoint', function () {
        it('should add program to savedProgram field', function () {
            return Exercise
                .findOne()
                .then(exercise => {
                    let updateData = { op: "add", path: "savedPrograms", value: exercise._id };
                    return updateData;
                })
                .then(updateData => {
                    return User
                        .findOne()
                        .then(user => {
                            return chai.request(app)
                                .patch(`/users/${user.id}`)
                                .set('Authorization', `Bearer ${token}`)
                                .send(updateData);
                        })
                        .then(res => {
                            expect(res).to.have.status(201);

                            return User.findById(res.body.id);
                        })
                        .then(user => {
                            expect(user.savedPrograms[0]).to.deep.equal(updateData.value);
                        })
                })
        });

        it('should remove program from savedProgram field', function () {
            return Exercise
                .findOne()
                .then(exercise => {
                    const updateData = { op: "add", path: "savedPrograms", value: exercise._id };
                    return updateData;
                })
                .then(updateData => {
                    return User
                        .findOne()
                        .then(user => {
                            return chai.request(app)
                                .patch(`/users/${user.id}`)
                                .set('Authorization', `Bearer ${token}`)
                                .send(updateData);
                        })
                        .then(res => {
                            expect(res).to.have.status(201);

                            return User.findById(res.body.id);
                        })
                        .then(user => {
                            expect(user.savedPrograms[0]).to.deep.equal(updateData.value);
                            return { user, updateData }
                        })
                        .then(({ user, updateData }) => {
                            updateData['op'] = 'remove';
                            return chai.request(app)
                                .patch(`/users/${user.id}`)
                                .set('Authorization', `Bearer ${token}`)
                                .send(updateData)
                        })
                        .then(res => {
                            expect(res).to.have.status(201);

                            return User.findById(res.body.id)
                        })
                        .then(user => {
                            expect(user.savedPrograms).to.not.include(updateData.value.toString())
                        })
                })
        });
    });
});