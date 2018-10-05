'use strict'

var dynamodbb = require('serverless-dynamodb-client');

const docClient = dynamodbb.doc;

const table = process.env.APP_SETTINGS_DB_NAME;

const getProjectManagers = async () => {
    return new Promise((resolve,reject) => {
      const params = {
        TableName: table,
        FilterExpression: "contains(:elementId, #elementId)",
        ExpressionAttributeNames: {
            "#elementId": "elementId",
        },
        ExpressionAttributeValues: {
             ":elementId": 'projectManagers'
        }
      };
  
      docClient.scan(params, (err,data) => {
        if(err) {
          console.error("Failed to get project managers " + err);
          reject(err);
        } else {
          resolve(data.Items[0].profiles);
        }
      });
    });
}

const getSystemAdmins = async () => {
  return new Promise((resolve,reject) => {
    const params = {
      TableName: table,
      FilterExpression: "contains(:elementId, #elementId)",
      ExpressionAttributeNames: {
          "#elementId": "elementId",
      },
      ExpressionAttributeValues: {
           ":elementId": 'systemAdmins'
      }
    };

    docClient.scan(params, (err,data) => {
      if(err) {
        console.error("Failed to get system admins " + err);
        reject(err);
      } else {
        resolve(data.Items[0].profiles);
      }
    });
  });
}

const getManagerApplications = async () => {
  return new Promise((resolve,reject) => {
    const params = {
      TableName: table,
      FilterExpression: "contains(:elementId, #elementId)",
      ExpressionAttributeNames: {
          "#elementId": "elementId",
      },
      ExpressionAttributeValues: {
           ":elementId": 'projectManagerApplications'
      }
    };

    docClient.scan(params, (err,data) => {
      if(err) {
        console.error("Failed to get system admins " + err);
        reject(err);
      } else {
        resolve(data.Items[0].profiles);
      }
    });
  });
}

const saveUserRoles = async (users) => {
  const params = {
      TableName: table,
      Item: users
  };
  return new Promise((resolve, reject) => {
      return docClient.put(params, (error, data) => {
          if (error) {
              console.log(error);
              reject("Could not save user roles");
          } else {
              resolve(data);
          }
      })
  });
};

const savePMApplication = async (projectManagerApplications) => {
  const params = {
    TableName: table,
    Item: projectManagerApplications
  };
  return new Promise((resolve, reject) => {
    return docClient.put(params, (error, data) => {
        if (error) {
            console.log(error);
            reject("Could not save project manager applications");
        } else {
            resolve(data);
        }
    })
});
}

module.exports = {
    getProjectManagers,
    getSystemAdmins,
    getManagerApplications,
    saveUserRoles,
    savePMApplication
};