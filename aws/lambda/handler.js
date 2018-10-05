'use strict';

const signinHandler = require('./lib/handlers/signinHandler');
const callbackHandler = require('./lib/handlers/callbackHandler');
const refreshHandler = require('./lib/handlers/refreshHandler');
const authorizeHandler = require('./lib/handlers/authorizeHandler');
const setupSchemaHandler = require('./lib/storage/fauna/faunaUser').setupSchemaHandler;
const identityHandler = require('./lib/handlers/identityHandler');
const projectsHandler = require('./lib/handlers/projectsHandler');

module.exports.signin =
  (event, context) =>
    signinHandler(event, context);

module.exports.callback =
  (event, context) =>
    callbackHandler(event, context);

module.exports.refresh =
  (event, context, cb) =>
    refreshHandler(event, cb);

module.exports.authorize =
  (event, context, cb) =>
    authorizeHandler(event, cb);

module.exports.schema =
  (event, context, cb) =>
    setupSchemaHandler(event, cb);

module.exports.whoami =
  (event, context, cb) =>
    identityHandler.whoami(event, cb);

module.exports.projectManagers =
  (event, context, cb) =>
    identityHandler.projectManagers(event, cb);

module.exports.saveProject =
  (event, context, cb) =>
    projectsHandler.newProject(event, cb);

module.exports.getAllProjects =
  (event, context, cb) =>
    projectsHandler.getAllProjects(event, cb);

module.exports.pmApplication =
  (event, context, cb) =>
    identityHandler.notifyServiceDeskForPMApplication(event, cb);

module.exports.getSpecificProject =
  (event, context, cb) => 
    projectsHandler.getSpecificProject(event, cb);

module.exports.users =
  (event, context, cb) =>
    identityHandler.users(event, cb);

module.exports.projectManagerApplications =
  (event, context, cb) =>
    identityHandler.projectManagerApplications(event, cb);

module.exports.saveUserRole = 
  (event, context, cb) =>
    identityHandler.saveUserRole(event, cb);

module.exports.resolvePMApplication =
  (event, context, cb) => 
    identityHandler.resolveProjectManagerApplications(event,cb);