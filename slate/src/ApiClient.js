import axios from 'axios';
import qs from 'qs';

const client = axios.create({
    baseURL: process.env.REACT_APP_API_CLIENT_BASE_URL,
    // withCredentials: true,
    timeout: 10000,
    // headers: {'Authentication': 'Bearer ' + jwt},
    paramsSerializer: qs.stringify
});

class ApiClient {

    setAccessToken(token) {
        client.defaults.headers.common.Authorization = token;
        console.log(token);
    }

    /* eslint-disable no-console */
    setGeneralErrorHandler(callback) {
        client.interceptors.response.use(function (response) {
            return response;
        }, function (error) {

            if (callback) {

                var reason = '';

                if (error.response && error.response.data) {
                    reason = error.response.data.message || error.response.data.error;
                } else {
                    reason = error.message;
                }

                callback(reason);
                return Promise.reject(reason);
            }

            console.error('Request failed. Error config: %o', error.config);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.info('Response data: %o', error.response.data);
                console.info('Response status: %o', error.response.status);
                console.info('Response headers: %o', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.info('Request: %o', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error(error.message);
            }
            return Promise.reject(error);
        });
    }
    /* eslint-enable no-console */

    whoami() {
        return new Promise(function(resolve,reject) {
            client
                .get('/whoami')
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    getProjects() {
        return new Promise((resolve,reject) => {
            client
                .get('/getProjects')
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    saveProject(project) {
        return new Promise((resolve,reject) => {
            client
                .post('/saveProject',project || {})
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    pmApplication(user) {
        return new Promise((resolve, reject) => {
            client
                .post('/pmApplication',user || {})
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    resolvePmApplication(user) {
        return new Promise((resolve, reject) => {
            client
                .post('/resolvePmApplication', user || {})
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    getProjectManagerApplications() {
        return new Promise((resolve, reject) => {
            client
                .get('/projectManagerApplications')
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    projectManagers() {
        return new Promise((resolve,reject) => {
            client
                .get('/projectManagers')
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    project(key) {
        return new Promise((resolve,reject) => {
            client
                .get('/project?project=' + key)
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    users() {
        return new Promise((resolve, reject) => {
            client
                .get('/users')
                .then(response => resolve(response.data), error => reject(error));
        });
    }

    assignAdministratorRole(user) {
        let body = {
            user: user,
            role: "ADMINISTRATOR"
        };
        return new Promise((resolve, reject) => {
            client
                .post('/userRole', body || {})
                .then(response => resolve(response.data), error => reject(error));
        });
    }

}

export default new ApiClient();