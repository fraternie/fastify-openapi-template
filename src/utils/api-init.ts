import * as apiDocs from '../../api-docs.json';
import {
  HandlerRequest,
  HandlerResponse,
  openApiHandlers,
  Operation,
} from './openapi-utils';
import { OpenAPIBackend } from 'openapi-backend';
import { BaseService } from "../services/base.service";

// maps the operationId of path to it's handler
// while adding response and request type checks
const registerPath =
  <T extends Operation>(operationName: T, serviceClass: any) =>
  async (ctx: Request, req: HandlerRequest<T>): HandlerResponse<T> =>
    await serviceClass[operationName](req);

const registerService = (serviceName: Record<string, any>) =>
  // get all static methods of a class
  Object.getOwnPropertyNames(serviceName)
    .filter((e) => !['length', 'prototype', 'name'].includes(e))
    // reduce the received list to a map with institute name and it's handler
    .reduce(
      (dict, key) => ({
        ...dict,
        [key]: registerPath(key as Operation, serviceName),
      }),
      {},
    );

// automatically registers all the static methods
// of a service(make sure it's same as operationId)
export const apiInit = async (apiInstance: OpenAPIBackend) => {
  apiInstance.register({
    api: (ctx, req, reply) => reply.send(apiDocs),

    ...registerService(BaseService),

    ...openApiHandlers,
  });

  await apiInstance.init();
  return apiInstance;
};
