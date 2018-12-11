'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const expect = chai.expect;

const {Program} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedProgramData() {
    console.info('seeding program data');
    const seedData = [];
  
    for (let i = 1; i <= 2; i++) {
      seedData.push(generateProgramData());
    }
    // console.log(seedData);
    return Program.insertMany(seedData);
  }

function generateProgramData() { 
    return {
        programName: faker.lorem.words(),
        author: {_id: '5af50c84c082f1e92f83420a', firstName: faker.name.firstName(), lastName: faker.name.lastName(), userName: faker.internet.userName()},
        categories: [faker.lorem.word(), faker.lorem.word(),faker.lorem.word()],
        schedule: [
            {
                name: faker.lorem.words(),
                exercises: [
                    {
                        exercise: '5c0df44f7a125fc599955de7',
                        sets: faker.random.number(),
                        reps: faker.random.number(),
                    },
                    {
                        exercise: '5c0df44f7a125fc599955de6',
                        distance: faker.random.number(),
                        time: faker.random.number(),
                    },
                    {
                        exercise: '5c0df44f7a125fc599955de5',
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

describe('Program API resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedProgramData();
    })

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe.skip('GET endpoint', function() {
        it('should return all existing programs', function() {
            let res;
            return chai.request(app)
                .get('/programs')
                .then(_res => {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.programs).to.have.lengthOf.at.least(1);

                    return Program.count();
                })
                .then(count => {
                    expect(res.body.programs).to.have.lengthOf(count);
                })
        })
        it('should return programs with the right fields', function() {
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
                        // expect(program.schedule).to.be.an('array');
                        // expect(program.schedule).to.have.lengthOf.at.least(1);
                    });

                    resProgram = res.body.programs[0];
                    return Program.findById(resProgram.id)
                })
                .then(program => {
                    expect(resProgram.programName).to.equal(program.programName);
                    expect(resProgram.author).to.equal(program.author);
                    expect(resProgram.categories).to.equal(program.categories);
                    expect(resProgram.schedule).to.equal(program.schedule);
                });
        });
    })

    describe.skip('POST endpoint', function(){
        it('should add a new program', function() {
            const newProgram = generateProgramData();
            
            return chai.request(app)
                .post('/program')
                .send(newProgram)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(
                        'id', 'programName', 'author', 'categories', 'schedule');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.programName).to.equal(newProgram.programName);
                    expect(res.body.author).to.equal(newProgram.author);
                    expect(res.body.categories).to.equal(newProgram.categories);
                    expect(res.body.schedule).to.equal(newProgram.schedule);

                    return Program.findById(res.body.id);
                })
                .then(function(program) {
                    expect(program.programName).to.equal(newProgram.programName);
                    expect(program.author).to.equal(newProgram.author);
                    expect(program.categories).to.equal(newProgram.categories);
                    expect(program.schedule).to.equal(newProgram.schedule);
                });
        });
    });
})