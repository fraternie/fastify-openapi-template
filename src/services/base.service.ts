import { HandlerRequest, HandlerResponse } from "../utils/openapi-utils";

export class BaseService {
    static async base(
        req?: HandlerRequest<'base'>,
    ): HandlerResponse<'base'> {
        return {
            notifyUser: false,
            message: 'Success',
            code: 200,
            data: "Success",
            error: null,
        };
    }
}
