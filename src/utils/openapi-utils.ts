import { components, operations } from '../../schema';
import { FastifyRequest } from 'fastify';

export type BaseResponse = components['schemas']['BaseSchema'];

export type Operation = keyof operations;

export type FullOperation<O extends Operation> = operations[O] & {
    parameters: {
        path: Record<string, unknown>;
        query: Record<string, unknown>;
    };
    requestBody: {
        content: {
            'application/json': Record<string, unknown>;
        };
    };
    responses: {
        '200': {
            content: {
                'application/json': Record<string, unknown> | void;
            };
        };
        '201': {
            content: {
                'application/json': Record<string, unknown> | void;
            };
        };
    };
};

export type Code = '200' | '201';

export type HandlerResponse<O extends Operation,
    T extends Code = '200',
    > = Promise<FullOperation<O>['responses'][T]['content']['application/json']>;

export type HandlerRequest<O extends Operation> = FastifyRequest<{
    Querystring: FullOperation<O>['parameters']['query'];
    Params: FullOperation<O>['parameters']['path'];
    Body: FullOperation<O>['requestBody']['content']['application/json'];
}>;

export const openApiHandlers = {
    validationFail: (ctx, _, reply) =>
        reply.status(400).send(<BaseResponse> {
            message: 'Input data not correct!',
            code: 400,
            notifyUser: false,
            error: { message: ctx.validation.errors[0].message, type: 'BadRequest' },
        }),

    postResponseHandler: (ctx, req, reply) => {
        if ( !reply.sent ) {
            const valid = ctx.api.validateResponse(ctx.response, ctx.operation);
            if ( valid.errors ) {
                // response validation failed
                return reply.status(500).send(<BaseResponse> {
                    message: 'Something went wrong on our side!',
                    code: 500,
                    notifyUser: false,
                    error: valid.errors[0],
                });
            }
            return reply.status(ctx.response.code).send(ctx.response);
        }
    },

    notFound: (ctx, req, reply) =>
        reply.status(404).send(<BaseResponse> {
            message: 'Failed to execute this request!',
            code: 404,
            notifyUser: false,
            error: { message: 'Route not found', type: 'NotFound' },
        }),
};
