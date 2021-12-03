import { AuthUser, HandlerRequest, HandlerResponse, openApiHandlers, Operation, } from './openapi-utils';
import { OpenAPIBackend } from 'openapi-backend';
import { Boom } from "@hapi/boom";
import { BaseService } from "../services/base.service";
import { authenticate } from "./auth-controller";

// maps the operationId of path to it's handler
// while adding response and request type checks
const registerPath =
    <T extends Operation>(operationName: T, serviceClass: any) =>
        async (ctx: Request, req: HandlerRequest<T>): HandlerResponse<T> =>
            await serviceClass[operationName](req);

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
    })

    apiInstance.register({
        ...registerService(BaseService),

        ...openApiHandlers,
    });

    await apiInstance.init();
    return apiInstance;
};
