'use strict';

// Common
const Promise = require('bluebird');

const cognitoUser = require('./cognito/cognitoUser');
const dynamoUser = require('./dynamo/dynamoUser');
const faunaUser = require('./fauna/faunaUser');

const saveUser = (profile) => {
  if (!profile) {
    return Promise.reject('Invalid profile');
  }
   return dynamoUser.saveUser(profile);

  return Promise.resolve(true);
};

const getAllUsers = () => {
  return dynamoUser.getAllUsers();
}
exports = module.exports = {
  saveUser,
  getAllUsers
};
