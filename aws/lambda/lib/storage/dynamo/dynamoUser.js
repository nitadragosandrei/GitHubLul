'use strict';

const table = process.env.USERS_DB_NAME;

var dynamodbb = require('serverless-dynamodb-client');

const docClient = dynamodbb.doc;

// Common
const AWS = require('aws-sdk');

const config = {
  region: AWS.config.region || process.env.REGION || 'eu-west-1',
};

if (process.env.LOCAL_DDB_ENDPOINT) {
  Object.assign(config, { endpoint: process.env.LOCAL_DDB_ENDPOINT });
}

const dynamodb = new AWS.DynamoDB.DocumentClient(config);

const saveUser = (profile) => {
  const params = {
    TableName: table,
    Item: profile
  };
  return dynamodb.put(params).promise();
};

const getUser = (userId) => {

  return new Promise((resolve, reject) => {
    const params = {
      TableName: table,
      Key: {
        userId: userId
      }
    };

    docClient.get(params, (err, data) => {
      if (err) {
        console.error("Failed to get user " + userId + ":", JSON.stringify(err, null, 2));
        reject("Failed to get user " + userId + " from dynamodb!");
      } else {
        resolve(data.Item);
      }
    });

  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: table
    };

    docClient.scan(params, (err, data) => {
      if(err) {
        console.error("Failed to get users list", JSON.stringify(err,null,2));
        reject("Failed to get user list from DynamoDB");
      } else {
        resolve(data.Items);
      }
    });
  });
}

module.exports = {
  saveUser,
  getUser,
  getAllUsers
};
