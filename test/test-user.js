'use strict';

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const expect = chai.expect;

const {User} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedUserData() {
    console.info('seeding user data');
    const seedData = [];
  
    for (let i = 1; i <= 10; i++) {
      seedData.push(generateUserData());
    }
    return User.insertMany(seedData);
  }

function generateUserData() { 
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.internet.userName(),
        userPrograms: [faker.lorem.words(), faker.lorem.words(), faker.lorem.words()],
        savedPrograms: [faker.lorem.words(), faker.lorem.words(), faker.lorem.words()]
    }
}

function tearDownDb() {
    console.warn('Deleting Database');
    return mongoose.connection.dropDatabase();
  }

describe('User API resource', function() {
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedUserData();
    })

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET endpoint', function() {
        it('should return all existing users', function() {
            let res;
            return chai.request(app)
                .get('/users')
                .then(_res => {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body.users).to.have.lengthOf.at.least(1);

                    return User.count();
                })
                .then(count => {
                    expect(res.body.users).to.have.lengthOf(count);
                })
        })
        it('should return users with the right fields', function() {
            let resUser;
            return chai.request(app)
                .get('/users')
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.users).to.be.an('array');
                    expect(res.body.users).to.have.lengthOf.at.least(1);

                    res.body.users.forEach(user => {
                        expect(user).to.be.an('object');
                        expect(user).to.include.keys('id', 'firstName', 'lastName', 'userName')
                    });

                    resUser = res.body.users[0];
                    return User.findById(resUser.id)
                })
                .then(user => {
                    expect(resUser.firstName).to.equal(user.firstName);
                    expect(resUser.lastName).to.equal(user.lastName);
                    expect(resUser.userName).to.equal(user.userName);
                });
        });
    })

    describe('POST endpoint', function(){
        it('should add a new user', function() {
            const newUser = generateUserData();
            
            return chai.request(app)
                .post('/users')
                .send(newUser)
                .then(function(res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(
                        'id', 'firstName', 'lastName', 'userName');
                    expect(res.body.id).to.not.be.null;
                    expect(res.body.firstName).to.equal(newUser.firstName);
                    expect(res.body.lastName).to.equal(newUser.lastName);
                    expect(res.body.userName).to.equal(newUser.userName)

                    return User.findById(res.body.id);
                })
                .then(function(user) {
                    expect(user.firstName).to.equal(newUser.firstName);
                    expect(user.lastName).to.equal(newUser.lastName);
                    expect(user.userName).to.equal(newUser.userName);
                });
        });
    });
})