'use strict';

const userStorage = require('../storage/dynamo/dynamoUser');
const appSettingsStorage = require('../storage/appSettingsStorage');
const projectStorage = require('../storage/projectsStorage');

const buildResponse = require('../helpers').buildResponse;

const userRoles = {
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    ADMINISTRATOR: 'ADMINISTRATOR',
    DEVELOPER: "DEVELOPER"
};

const whoami = (event, callback) => {
    const userId = event.requestContext.authorizer.principalId;

    userStorage.getUser(userId).then(async (user) => {
        let data = {
            email: user.email,
            name: user.name,
            userId: user.userId
        };
        let roles = new Array();
        const projectManagers = await appSettingsStorage.getProjectManagers();
        if (projectManagers !== null && projectManagers !== undefined && projectManagers.length > 0) {
            projectManagers.forEach(element => {
                if (element.userId === userId) {
                    roles.push(userRoles.PROJECT_MANAGER);
                }
            });
        }
        const systemAdmins = await appSettingsStorage.getSystemAdmins();
        if (systemAdmins !== null && systemAdmins !== undefined && systemAdmins.length > 0) {
            systemAdmins.forEach(element => {
                if (element.userId === userId) {
                    roles.push(userRoles.ADMINISTRATOR);
                }
            });
        }
        if (roles.length == 0) {
            roles.push(userRoles.DEVELOPER);
        }
        data.roles = roles;
        let response = buildResponse(200, data);
        callback(null, response);
    }).catch((error) => {
        console.log(error);
        const response = buildResponse(400);
        callback(null, response);
    });
};

const projectManagers = async (event, callback) => {
    const managers = await appSettingsStorage.getProjectManagers();
    if (managers !== null && managers !== undefined && managers.length > 0) {
        let response = buildResponse(200, managers);
        callback(null, response);
    } else {
        const response = buildResponse(500);
        callback(null, response);
    }
}

const projectManagerApplications = async (event, callback) => {
    const applications = await appSettingsStorage.getManagerApplications();
    if (applications !== null && applications !== undefined && applications.length > 0) {
        let response = buildResponse(200, applications);
        callback(null, response);
    } else {
        let response = buildResponse(200, []);
        callback(null, response);
    }
}

const resolveProjectManagerApplications = async (event, callback) => {
    const params = JSON.parse(event.body);

    try {
        let applications = await appSettingsStorage.getManagerApplications();
        if (applications !== null && applications !== undefined && applications.length > 0) {
            applications = applications.filter(element => {
                if (element.userId === params.userId) {
                    return false;
                }
                return true;
            });
            let elementToSave = {
                elementId: "projectManagerApplications",
                profiles: applications
            };
            await appSettingsStorage.savePMApplication(elementToSave);

            let projectManagers = await appSettingsStorage.getProjectManagers();
            let projectManager = {
                userId: params.userId,
                name: params.name
            };
            if (projectManagers !== null && projectManagers !== undefined && projectManagers.length > 0) {
                projectManagers.push(projectManager);
            } else {
                projectManagers = new Array();
                projectManagers.push(projectManager);
            }
            let toSave = {
                elementId: "projectManagers",
                profiles: projectManagers
            };
            await appSettingsStorage.saveUserRoles(toSave);

            let response = buildResponse(200);
            callback(null, response);
        }
    } catch (err) {
        console.log(err);
        let response = buildResponse(500, err);
        callback(null, response);
    }
}

const notifyServiceDeskForPMApplication = async (event, callback) => {
    const params = JSON.parse(event.body);

    try {
        let projectManagerApplications = await appSettingsStorage.getManagerApplications();
        if (projectManagerApplications !== null && projectManagerApplications !== undefined && params.userId !== null && params.userId !== undefined) {
            let applicant = {
                name: params.name,
                userId: params.userId
            };
            projectManagerApplications.push(applicant);
            let elementToSave = {
                elementId: "projectManagerApplications",
                profiles: projectManagerApplications
            };
            await appSettingsStorage.savePMApplication(elementToSave);
        }
    } catch (err) {
        let response = buildResponse(400, err);
        callback(null, response);
    }
    projectStorage.sendPMNotification(params.name, params.email, callback);
}

const users = (event, callback) => {
    userStorage.getAllUsers().then((users) => {
        let response = buildResponse(200, users);
        callback(null, response);
    }).catch((error) => {
        console.log(error);
        const response = buildResponse(400);
        callback(null, response);
    });
}

const saveUserRole = async (event, callback) => {
    const item = JSON.parse(event.body);
    if (item.role === userRoles.PROJECT_MANAGER) {
        let projectManagers = await appSettingsStorage.getProjectManagers();
        if (projectManagers !== null && projectManagers !== undefined && projectManagers.length > 0) {
            projectManagers.push(item.user);
        } else {
            projectManagers = new Array();
            projectManagers.push(item.user);
        }
        let elementToSave = {
            elementId: "projectManagers",
            profiles: projectManagers
        };
        try {
            await appSettingsStorage.saveUserRoles(elementToSave);
            let response = buildResponse(200);
            callback(null, response);
        } catch (err) {
            let response = buildResponse(400, err);
            callback(null, response);
        }
    } else if (item.role === userRoles.ADMINISTRATOR) {
        let administrators = await appSettingsStorage.getSystemAdmins();
        if (administrators !== null && administrators !== undefined && administrators.length > 0) {
            administrators.push(item.user);
        } else {
            administrators = new Array();
            administrators.push(item.user);
        }
        let elementToSave = {
            elementId: "systemAdmins",
            profiles: administrators
        }
        try {
            await appSettingsStorage.saveUserRoles(elementToSave);
            let response = buildResponse(200);
            callback(null, response)
        } catch (err) {
            let response = buildResponse(400, err);
            callback(null, response);
        }
    }
}

exports = module.exports = {
    whoami,
    projectManagers,
    users,
    projectManagerApplications,
    resolveProjectManagerApplications,
    notifyServiceDeskForPMApplication,
    saveUserRole
};