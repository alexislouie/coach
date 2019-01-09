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
        password: faker.lorem.word()
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

function tearDownDb() {
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
}

describe.only('Program API resource', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedExercise()
        .then(exercise => {
          return seedAuthor()
            .then(author => ({exercise, author}))
        })
            .then(({exercise, author}) => seedProgramData(author, exercise))
            .catch(err => console.log(err));
    })

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe.skip('GET endpoint', function () {
        it('should find all programs accordingly to queried field', function() {

        })
        // it('should return all existing programs', function () {
        //     let res;
        //     return chai.request(app)
        //         .get('/programs')
        //         .then(_res => {
        //             res = _res;
        //             expect(res).to.have.status(200);
        //             expect(res.body.programs).to.have.lengthOf.at.least(1);

        //             return Program.count();
        //         })
        //         .then(count => {
        //             expect(res.body.programs).to.have.lengthOf(count);
        //         })
        // })
        it('should return programs with the right fields', function () {
            let resProgram;
            return chai.request(app)
                .get('/programs')
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.programs).to.be.an('array');
                    expect(res.body.programs).to.have.lengthOf.at.least(1);

                    res.body.programs.forEach(program => {
                        expect(program).to.be.an('object');
                        expect(program).to.include.keys('id', 'programName', 'author', 'categories', 'schedule');
                        expect(program.schedule).to.have.lengthOf.at.least(1);
                    });

                    resProgram = res.body.programs[0];
                    return Program.findById(resProgram.id)
                })
                .then(program => {
                    expect(resProgram.programName).to.equal(program.programName);
                    User.findById(program.author)
                        .then(author => expect(resProgram.author).to.equal(author.userName));
                    expect(resProgram.categories).to.deep.equal(program.categories);

                    const exerciseIds = [];
                    program.schedule.forEach(day => {
                        day.exercises.forEach(exercise => {
                            exerciseIds.push(exercise._id.toString())
                        });
                    })
                    return exerciseIds
                })
                .then(exerciseIds => {
                    const resProgramIds = [];
                    resProgram.schedule.forEach(day => {
                        day.exercises.forEach(exercise => resProgramIds.push(exercise._id));
                    })
                    expect(exerciseIds).to.deep.equal(resProgramIds);
                });
        });
    })

    describe('POST endpoint', function () {
        it('should add a new program', function () {
            const newProgram = generateProgramData();
            return chai.request(app)
                .post('/programs')
                .send(newProgram)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(
                        'id', 'programName', 'author', 'categories', 'schedule');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.programName).to.equal(newProgram.programName);
                    expect(res.body.author).to.equal(newProgram.author);
                    // expect(res.body.categories).to.equal(newProgram.categories);
                    // expect(res.body.schedule).to.equal(newProgram.schedule);

                    return Program.findById(res.body.id);
                })
                .then(function (program) {
                    expect(program.programName).to.equal(newProgram.programName);
                    expect(program.author).to.equal(newProgram.author);
                    expect(program.categories).to.equal(newProgram.categories);
                    expect(program.schedule).to.equal(newProgram.schedule);
                });
        });
    });

    describe('PUT endpoint', function () {
        // strategy:
        //  1. Get an existing post from db
        //  2. Make a PUT request to update that post
        //  4. Prove post in db is correctly updated
        it('should update a program', function () {
            const newProgram = generateProgramData();

            const updateProgram = {
                programName: 'cats cats cats',
                categories: ['Chest', 'Shoulders'],
                schedule: []
              };
              
            return chai.request(app)
                .post('/programs')
                .send(newProgram)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(
                        'id', 'programName', 'author', 'categories', 'schedule');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.programName).to.equal(newProgram.programName);
                    expect(res.body.author).to.equal(newProgram.author);
                    // expect(res.body.categories).to.equal(newProgram.categories);
                    // expect(res.body.schedule).to.equal(newProgram.schedule);

                    return Program.findById(res.body.id);
                })
                .then(function (program) {
                    expect(program.programName).to.equal(newProgram.programName);
                    expect(program.author).to.equal(newProgram.author);
                    expect(program.categories).to.equal(newProgram.categories);
                    expect(program.schedule).to.equal(newProgram.schedule);
                });
        });
    });

    describe('DELETE endpoint', function () {
        it('should add a new program', function () {
            const newProgram = generateProgramData();

            return chai.request(app)
                .post('/programs')
                .send(newProgram)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(
                        'id', 'programName', 'author', 'categories', 'schedule');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.programName).to.equal(newProgram.programName);
                    expect(res.body.author).to.equal(newProgram.author);
                    // expect(res.body.categories).to.equal(newProgram.categories);
                    // expect(res.body.schedule).to.equal(newProgram.schedule);

                    return Program.findById(res.body.id);
                })
                .then(function (program) {
                    expect(program.programName).to.equal(newProgram.programName);
                    expect(program.author).to.equal(newProgram.author);
                    expect(program.categories).to.equal(newProgram.categories);
                    expect(program.schedule).to.equal(newProgram.schedule);
                });
        });
    });
})