import awsLambdaFastify from 'aws-lambda-fastify';
import { initServer } from './index';
import { FastifyInstance } from 'fastify';

let server: FastifyInstance;

exports.handler = async (event, context) => {
  if (!server) server = await initServer();
  return awsLambdaFastify(server)(event, context);
};
