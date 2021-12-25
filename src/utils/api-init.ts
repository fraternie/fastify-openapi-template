import { Authentication, AuthUser, FullRequest, HandlerResponse, openApiHandlers, Operation } from './openapi-utils';
import { Boom } from '@hapi/boom';
import { BaseService } from '../services/base.service';
import { authenticate } from './auth-controller';
import { OpenAPIBackend } from 'openapi-backend';
import { ErrorResponse } from './api-types';

// maps the operationId of path to it's handler
// while adding response and request type checks
const registerPath =
  <T extends Operation>(operationName: T, serviceClass: any) =>
    async (
      ctx: any,
      req: FullRequest<T>,
    ): Promise<HandlerResponse<T> | ErrorResponse> => {
      const fullRequest = {
        ...( req.query || {} ),
        ...( req.body || {} ),
        ...( req.params || {} ),
      };
      // if auth failed
      if (
        ctx.security &&
        !ctx.security.authorized &&
        'firebaseAuth' in ctx.security
      )
        // noinspection ExceptionCaughtLocallyJS
        throw ctx.security.firebaseAuth.error;

      const auth = ctx.security as Authentication;
      let result: HandlerResponse<T> | ErrorResponse;

      try {
        result = await serviceClass[operationName]({
          env: fullRequest,
          auth: auth.firebaseAuth,
        });
      } catch ( error ) {
        let errorDescription: string;
        let data: any;
        let statusCode: any;

        if ( error instanceof Boom ) {
          errorDescription = error.message;
          data = error.data;
          statusCode = error.output.statusCode;
        } else {
          errorDescription = 'Internal Server Error';
          statusCode = 500;
        }
        result = {
          error: errorDescription,
          statusCode: statusCode,
          message: error.message,
          data,
        };
      }

      return result;
    };

const registerService = (serviceName: Record<string, any>) =>
  // get all static methods of a class
  Object.getOwnPropertyNames(serviceName)
    .filter((e) => ![ 'length', 'prototype', 'name' ].includes(e))
    // reduce the received list to a map with institute name and it's handler
    .reduce(
      (dict, key) => ( {
        ...dict,
        [key]: registerPath(key as Operation, serviceName),
      } ),
      {},
    );

// automatically registers all the static methods
// of a service(make sure it's same as operationId)
export const apiInit = async (apiInstance: OpenAPIBackend) => {
  apiInstance.registerSecurityHandler('firebaseAuth', async e => {
    try {
      const headers = e.request.headers;

      // remove "Bearer " prefix
      const idToken = ( headers.Authorization || headers.authorization )?.slice(7);
      if ( !idToken || typeof idToken !== 'string' )
        // noinspection ExceptionCaughtLocallyJS
        throw new Boom('No id token sent', { statusCode: 400 });


      const authUser = await authenticate(idToken);

      if ( !authUser )
        // noinspection ExceptionCaughtLocallyJS
        throw new Boom('Token expired', { statusCode: 401 });

      return { ...authUser as AuthUser, idToken };

    } catch ( error ) {
      if ( error instanceof Boom )
        throw error;
      else
        throw new Boom(error.message, { statusCode: error.code || 500 });
    }
  });

  apiInstance.register({
    ...registerService(BaseService),

    ...openApiHandlers,
  });

  await apiInstance.init();
  return apiInstance;
};
