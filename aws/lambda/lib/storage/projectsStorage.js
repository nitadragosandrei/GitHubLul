'use strict';

const buildResponse = require('../helpers').buildResponse;

const table = process.env.PROJECTS_DB_NAME;

var dynamodbb = require('serverless-dynamodb-client');

//const docClient = dynamodbb.doc;

// Common
const AWS = require('aws-sdk');

const config = {
    region: AWS.config.region || process.env.REGION || 'eu-west-1',
};

AWS.config.update(config);

if (process.env.LOCAL_DDB_ENDPOINT) {
    Object.assign(config, { endpoint: process.env.LOCAL_DDB_ENDPOINT });
}

const docClient = new AWS.DynamoDB.DocumentClient(config);

const saveProject = (project) => {
    const params = {
        TableName: table,
        Item: project
    };
    return new Promise((resolve, reject) => {
        return docClient.put(params, (error, data) => {
            if (error) {
                console.log(error);
                reject("Could not save project");
            } else {
                resolve(data);
            }
        })
    });

};

const getAllProjects = () => {
    return new Promise((resolve, reject) => {
        const searchParams = {
            TableName: table
        }
        docClient.scan(searchParams, (error, data) => {
            if (error) {
                console.log(error);
                reject("Cannot get projects from DynamoDB");
            } else {
                resolve(data.Items);
            }
        });
    });
}

const getSpecificProject = (projectId) => {
    return new Promise((resolve, reject) => {
        const searchParams = {
            TableName: table,
            FilterExpression: "contains(:projectId, #projectId)",
            ExpressionAttributeNames: {
                "#projectId": "projectKey",
            },
            ExpressionAttributeValues: {
                ":projectId": projectId
            }
        };
        docClient.scan(searchParams, (error, data) => {
            if (error) {
                console.log(error);
                reject("Cannot get project " + projectId);
            } else {
                resolve(data.Items[0]);
            }
        });
    });
}

const sendPMNotification = (name, email, callback) => {
    var params = {
        Destination: {
            CcAddresses: [],
            ToAddresses: ['slateservicedesk@gmail.com']
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: name + ' just applied for a PM Role. The user email is: ' + email
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'PM Role application - ' + name
            }
        },
        Source: 'slateservicedesk@gmail.com',
        ReplyToAddresses: ['slateservicedesk@gmail.com'],
    };

    var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

    sendPromise.then(
        function (data) {
            console.log(data.MessageId);
            let response = buildResponse(200, {});
            callback(null, response);
        }).catch(
            function (err) {
                console.error(err, err.stack);
                let response = buildResponse(500, {});
                callback(null, response);
            });


}

module.exports = {
    saveProject,
    getAllProjects,
    getSpecificProject,
    sendPMNotification
}