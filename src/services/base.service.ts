import { HandlerRequest, HandlerResponse } from "../utils/openapi-utils";

export class BaseService {
    static async base(
        { query: { count } }: HandlerRequest<'base'>,
    ): HandlerResponse<'base'> {
        return {
            data: `Base route called with count: ${ count }!!`,
            statusCode: 201
        };
    }
}
