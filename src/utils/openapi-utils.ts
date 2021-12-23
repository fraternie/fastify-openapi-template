import { operations } from '../../schema';
import { FastifyRequest } from 'fastify';
import admin from 'firebase-admin';
import { ErrorResponse, IType } from './api-types';
import fs from 'fs';
import { appEnv } from './constants';

export type Operation = keyof operations;

export type FullOperation<O extends Operation> = operations[O] & {
  parameters: {
    path: Record<never, never>;
    query: Record<never, never>;
  };
  requestBody: {
    content: {
      'application/json': Record<never, never>;
    };
  };
  responses: {
    '200': {
      content: {
        'application/json': Record<never, never> | void;
      };
    };
    '201': {
      content: {
        'application/json': Record<never, never> | void;
      };
    };
    '204': {
      content: {
        'application/json': void
      }
    }
  };
};

export type AuthUser =
  admin.auth.DecodedIdToken
  & { type?: IType, idToken?: string, username?: string, name?: string, imageUrl?: string };

export type Authentication = { firebaseAuth: AuthUser };

export type Code = '200' | '201' | '204';

export type HandlerResponse<O extends Operation, T extends Code = '200', > =
  Promise<FullOperation<O>['responses'][T]['content']['application/json']>;

export type FullRequest<O extends Operation> = FastifyRequest<{
  Querystring: FullOperation<O>['parameters']['query'];
  Params: FullOperation<O>['parameters']['path'];
  Body: FullOperation<O>['requestBody']['content']['application/json'];
}>;

export type HandlerRequest<O extends Operation> = {
  env: FullOperation<O>['parameters']['query'] & FullOperation<O>['parameters']['path'] &
    FullOperation<O>['requestBody']['content']['application/json'],
  // it is optional as some routes might not need authentication
  auth?: AuthUser
};

export const openApiHandlers = {
  api: (ctx, req, reply) => {
    if ( process.env.APP_ENV !== appEnv.dev )
      reply.status(401).send(<ErrorResponse> {
        message: 'Must be in DEV mode to view docs',
        statusCode: 401,
        error: 'UnAuthorized',
      });

    const api = fs.readFileSync('api-docs.yaml', 'utf8');
    reply.status(200).send(api);
  },

  validationFail: (ctx, _, reply) => {
    return reply.status(400).send(<ErrorResponse> {
      message: 'Request not valid!',
      statusCode: 400,
      data: ctx.validation.errors,
      error: 'BadRequest',
    });
  },

  postResponseHandler: (ctx, req, reply) => {
    if ( !reply.sent ) {
      const valid = ctx.api.validateResponse(ctx.response, ctx.operation);
      if ( valid.errors ) {
        // response validation failed
        return reply.status(500).send(<ErrorResponse> {
          message: 'Something went wrong on our side!',
          statusCode: 500,
          data: valid.errors,
          error: 'Internal Server Error',
        });
      }
      // automatically adds the 2XX status code to reply
      const statusCode = Object.keys(ctx.operation.responses).find((e) => e.startsWith('2'));
      delete ctx.response.statusCode;
      return reply.status(statusCode).send(ctx.response);
    }
  },

  notFound: (ctx, req, reply) =>
    reply.status(404).send(<ErrorResponse> {
      message: 'Failed to execute this request!',
      statusCode: 404,
      error: 'NotFound',
    }),
};
