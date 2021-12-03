import * as dotenv from 'dotenv';
dotenv.config();

import fastify, { FastifyInstance } from 'fastify';
import { apiInit } from './utils/api-init';
import { OpenAPIBackend } from 'openapi-backend';
import { BaseResponse } from "./utils/api-types";
import admin from "firebase-admin";
import AWS from "aws-sdk";

const app = fastify({
    logger: true,
});

const registerRoutes = async () => {
    const api = await apiInit(
        new OpenAPIBackend({ definition: './api-docs.json' }),
    );
    app.route({
        method: [ 'GET', 'DELETE', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'HEAD' ],
        url: '*',
        handler: async (req, reply) => {
            await api.handleRequest(
                {
                    body: req.body,
                    query: req.query as string | { [p: string]: string | string[] },
                    headers: req.headers,
                    method: req.method,
                    path: req.url,
                },
                req,
                reply,
            );
        },
    });
};

export const firebaseAdmin = admin.initializeApp(process.env.NODE_ENV !== "test" ? {
    credential: admin.credential.cert(process.env.SERVICE_ACCOUNT_PATH!)
} : {});

export const dynamodb = new AWS.DynamoDB.DocumentClient(process.env.NODE_ENV === "test" ?
    { endpoint: 'localhost:8000', sslEnabled: false, region: 'local-env' } : {});

export const s3 = new AWS.S3({
    signatureVersion: 'v4'
});

export const initServer = async () => {
    try {
        app.setErrorHandler((error, request, reply) => {
            app.log.error(error);
            const resError = {
                name: error?.name || 'InternalServerError',
                message: error?.message || 'Something went wrong on our side!',
                stack: error?.stack || '',
                code: error?.statusCode || 500,
            };
            reply.send(<BaseResponse> {
                message: resError.message,
                code: resError.code,
                notifyUser: true,
                error: error instanceof Array ? resError[0] : resError,
            });
        });
        await registerRoutes();
        return app;
    } catch ( err ) {
        app.log.error(err);
    }
};

if ( require.main === module ) {
    const port = process.env.PORT || process.env.APP_PORT;
    initServer().then((app: FastifyInstance) => app.listen(port, '0.0.0.0'));
}
