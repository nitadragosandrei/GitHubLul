'use strict';

const userStorage = require('../storage/dynamo/dynamoUser');
const projectStorage = require('../storage/projectsStorage');
const appSettingsStorage = require('../storage/appSettingsStorage');

const buildResponse = require('../helpers').buildResponse;

const newProject = (event, callback) => {
    const items = JSON.parse(event.body);
    projectStorage.saveProject(items).then((data) => {
        let response = buildResponse(200, data);
        callback(null, response);
    }).catch((error) => {
        console.log(error);
        let response = buildResponse(500, error);
        callback(null, response);
    });
}

const getAllProjects = (event, callback) => {
    projectStorage.getAllProjects().then((data) => {
        let responseGet = buildResponse(200, data);
        callback(null, responseGet);
    }).catch((error) => {
        console.log(error);
        let response = buildResponse(500, error);
        callback(null, response);
    });
}

const getSpecificProject = (event, callback) => {
    const projectId = event.queryStringParameters.project;
    projectStorage.getSpecificProject(projectId).then((data) => {
        let responseGet = buildResponse(200, data);
        callback(null, responseGet);
    }).catch((error) => {
        console.log(error);
        let response = buildResponse(500, error);
        callback(null, response);
    });
}

module.exports = {
    newProject,
    getAllProjects,
    getSpecificProject
}