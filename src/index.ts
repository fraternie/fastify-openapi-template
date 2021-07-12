import * as dotenv from 'dotenv';
dotenv.config();

import fastify from 'fastify';
import { apiInit } from './utils/api-init';
import { OpenAPIBackend } from 'openapi-backend';

const app = fastify({
  logger: true,
});

const registerRoutes = async () => {
  const api = await apiInit(
    new OpenAPIBackend({ definition: './api-docs.json' }),
  );
  app.route({
    method: ['GET', 'DELETE', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'HEAD'],
    url: '*',
    handler: async (req, reply) => {
      await api.handleRequest(
        {
          body: req.body,
          query: req.query,
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

const start = async () => {
  const port = process.env.PORT || process.env.APP_PORT;
  try {
    await registerRoutes();
    await app.listen(port, '0.0.0.0');
  } catch (err) {
    app.log.error(err);
  }
};

start().then();
