import * as apiDocs from '../../api-docs.json';
import { openApiHandlers } from './openapi-utils';

export const apiInit = async (apiInstance: any) => {
    apiInstance.register({
        api: (ctx, req, reply) => reply.send(apiDocs),

        // baseReply: (ctx: Request, req: FastifyRequest): BaseServiceReply =>
        //   BaseService.baseReply(req),

        ...openApiHandlers,
    });

    await apiInstance.init();
    return apiInstance;
};
