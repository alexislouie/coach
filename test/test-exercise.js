'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const expect = chai.expect;

const { Exercise } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

const authenticatedUser = chai.request.agent(app);
let token;

function seedExerciseData() {
    console.info('seeding user data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateExerciseData());
    }
    return Exercise.insertMany(seedData);
}

function generateExerciseData() {
    return {
        name: faker.lorem.words()
    }
}

function tearDownDb() {
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}

describe('User API resource', function () {
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
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('POST endpoint', function () {
        it('should add a new exercise', function () {
            return seedExerciseData()
                .then(() => {
                    const newExercise = generateExerciseData();

                    return chai.request(app)
                        .post('/exercises')
                        .set('Authorization', `Bearer ${token}`)
                        .send(newExercise)
                        .then(function (res) {
                            expect(res).to.have.status(201);
                            expect(res).to.be.json;
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.include.keys('id', 'name');
                            expect(res.body.id).to.not.be.null;
                            expect(res.body.name).to.equal(newExercise.name);

                            return Exercise.findById(res.body.id);
                        })
                        .then(function (exercise) {
                            expect(exercise.name).to.equal(newExercise.name);
                        });
                })

        });
    });
})