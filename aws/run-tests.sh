#!/usr/bin/env bash
SERVERLESS_PROJECT="serverless-authentication"
SERVERLESS_STAGE="dev"
SERVERLESS_REGION="eu-west-1"
LOCAL_DDB_ENDPOINT="http://127.0.0.1:8000"

docker-compose up -d

STAGE=$SERVERLESS_STAGE \
  REGION=$SERVERLESS_REGION \
  PROJECT=$SERVERLESS_PROJECT \
  LOCAL_DDB_ENDPOINT=$LOCAL_DDB_ENDPOINT \
  ./node_modules/.bin/mocha test/

docker-compose down
