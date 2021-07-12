import { components } from '../../schema';

export type BaseResponse = components['schemas']['BaseSchema'];

// export type BaseServiceReply =
//   operations['getBase']['responses']['200']['content']['application/json'];

export const openApiHandlers = {
    validationFail: (ctx, _, reply) =>
        reply.status(400).send(<BaseResponse> {
            message: 'Bad Request',
            code: 400,
            notifyUser: false,
            error: ctx.validation.errors,
        }),

    postResponseHandler: (ctx, req, reply) => {
        const valid = ctx.api.validateResponse(ctx.response, ctx.operation);
        if ( valid.errors ) {
            // response validation failed
            return reply.status(502).send(<BaseResponse> {
                message: 'Internal Server Error',
                code: 502,
                notifyUser: false,
                error: valid.errors,
            });
        }
        return reply.status(ctx.response.code).send(ctx.response);
    },

    notFound: (ctx, req, reply) =>
        reply.status(404).send(<BaseResponse> {
            message: 'Failed to execute this request!',
            code: 404,
            notifyUser: false,
            error: { description: 'Route not found' },
        }),
};
