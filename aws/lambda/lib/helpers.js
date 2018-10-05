'use strict';

const logger = require('log4js').getLogger();

const createResponseData = (id) => {
  const authorizationToken = {
    payload: {
      id
    }
  };

  return { authorizationToken };
};

const redirectProxyCallback = (context, data) => {
  context.succeed({
    statusCode: 302,
    headers: {
      Location: data.url
    }
  });
};

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

const log = (message) => {
  logger.debug(message);
};

exports = module.exports = {
  createResponseData,
  redirectProxyCallback,
  buildResponse,
  log
};
