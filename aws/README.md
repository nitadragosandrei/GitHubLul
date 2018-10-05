# Serverless Authentication

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

[![Build Status](https://travis-ci.org/laardee/serverless-authentication-boilerplate.svg?branch=master)](https://travis-ci.org/laardee/serverless-authentication-boilerplate)

This project is aimed to be a generic authentication boilerplate for the [Serverless framework](http://www.serverless.com).

This boilerplate is compatible with the Serverless v.1.0.0, to install Serverless framework run `npm install -g serverless`.

Webapp demo that uses this boilerplate: http://laardee.github.io/serverless-authentication-gh-pages

If you are using Serverless framework v.0.5, see branch https://github.com/laardee/serverless-authentication-boilerplate/tree/serverless-0.5

## Installation

Installation will create one DynamoDB table for OAuth state and refresh tokens.

1. Run `serverless install --url https://github.com/laardee/serverless-authentication-boilerplate`, clone or download the repository
2. Rename _example.env.yml_ in _authentication_ to _env.yml_ and set [environmental variables](#env-vars).
3. Change directory to `authentication` and run `npm install`.
4. Run `serverless deploy` on the authentication folder to deploy authentication service to AWS. Notice the arn of the authorize function.
5. (optional) Change directory to test-token and insert the arn of the authorizer function to authorizer/arn in serverless.yml. Then run `serverless deploy` to deploy test-token service.

If you wish to change the cache db name, change `CACHE_DB_NAME ` in _.env_ file and `TableName` in _serverless.yml_ in Dynamo resource.

## Set up Authentication Provider Application Settings

The redirect URI that needs to be defined in oauth provider's application settings is the callback endpoint of the API. For example if you use facebook login, the redirect URI is **https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/facebook** and for google **https://API-ID.execute-api.us-east-1.amazonaws.com/dev/authentication/callback/google**.

## Services

In this example project authentication and authorization services are separated from content API (test-token).

### Authentication

Authentication service and authorization function for content API. These can also be separated if needed.

Functions:

* authentication/signin
  * endpoint: /authentication/signin/{provider}, redirects to oauth provider login page
  * handler: signin function creates redirect url to oauth provider and saves `state` to DynamoDB
* authentication/callback
  * endpoint: /authentication/callback/{provider}, redirects back to client webapp with token url parameter
  * handler: function is called by oauth provider with `code` and `state` parameters and it creates authorization and refresh tokens
* authentication/refresh
  * endpoint: /authentication/refresh/{refresh_token}, returns new authentication token and refresh token
  * handler: function revokes refresh token
* authentication/authorize
  * endpoint: no end point
  * handler: is used by Api Gateway custom authorizer
* authentication/schema
  * invoke with `serverless invoke -f schema` to setup FaunaDB schema

### Test-token

Simulates content API.

Functions:

* test-token/test-token
  * endpoint: /test-token
  * handler: test-token function can be used to test custom authorizer, it returns principalId of custom authorizer policy. It is mapped as username in request template.

## <a id="env-vars"></a>Environmental Variables

Open `authentication/env.yml`, fill in what you use and other ones can be deleted.

```
dev:
# General
  SERVICE: ${self:service}
  STAGE: ${opt:stage, self:provider.stage}
  REGION: ${opt:region, self:provider.region}
  REDIRECT_CLIENT_URI: http://127.0.0.1:3000/
  TOKEN_SECRET: token-secret-123
# Database
  CACHE_DB_NAME: ${self:provider.environment.SERVICE}-cache-${self:provider.environment.STAGE}
  USERS_DB_NAME: ${self:provider.environment.SERVICE}-users-${self:provider.environment.STAGE}
# Cognito
  USER_POOL_ID: user-pool-id
# Providers
  PROVIDER_FACEBOOK_ID: fb-mock-id
  PROVIDER_FACEBOOK_SECRET: fb-mock-secret
  PROVIDER_GOOGLE_ID: g-mock-id
  PROVIDER_GOOGLE_SECRET: cg-mock-secret
  PROVIDER_MICROSOFT_ID: ms-mock-id
  PROVIDER_MICROSOFT_SECRET: ms-mock-secret
  PROVIDER_CUSTOM_GOOGLE_ID: g-mock-id
  PROVIDER_CUSTOM_GOOGLE_SECRET: cg-mock-secret
```

## Example Provider Packages

* facebook [serverless-authentication-facebook](https://www.npmjs.com/package/serverless-authentication-facebook)
* google [serverless-authentication-google](https://www.npmjs.com/package/serverless-authentication-google)
* windows live [serverless-authentication-microsoft](https://www.npmjs.com/package/serverless-authentication-microsoft)
* more to come

## <a id="custom-provider"></a>Custom Provider

Package contains example [/authentication/lib/custom-google.js](https://github.com/laardee/serverless-authentication-boilerplate/blob/master/authentication/lib/custom-google.js) how to implement custom authentication provider using generic Provider class. To test custom provider go to http://laardee.github.io/serverless-authentication-gh-pages and click 'custom-google' button.

## User database

To use FaunaDB to save user data. First [create a database here](https://fauna.com/serverless-cloud-sign-up), then:

1. configure `FAUNADB_SECRET` in `authentication/env.yml` with a server secret for your database
2. uncomment `return faunaUser.saveUser(profile);` from `authentication/lib/storage/usersStorage.js`
3. change the last line of  `authentication/lib/storage/cacheStorage.js` to `exports = module.exports = faunaCache;`
4. Run `serverless deploy` and then `serverless invoke -f schema`

To use DynamoBD to save user data:

1. uncomment `UsersTable` block from `authentication/serverless.yml` resources
2. uncomment `return dynamoUser.saveUser(profile);` from `authentication/lib/storage/usersStorage.js`

To use Cognito User Pool as user database:

1. create new user pool (http://docs.aws.amazon.com/cognito/latest/developerguide/setting-up-cognito-user-identity-pools.html)
2. copy user pool id to `authentication/env.yml`
3. uncomment `return saveCognito(profile);` from `authentication/lib/storage/usersStorage.js`

## Running Tests on Mac

* Install Docker and Docker Compose
* Run `npm install` in project root directory
* Run ./run-tests.sh
