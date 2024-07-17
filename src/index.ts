import { config } from 'dotenv';
config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import router from './routers';
import { corsMiddleware } from './middleware/corsMiddleware';

const app = new Hono();

app.use('*', corsMiddleware);
app.route('/', router);

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});

export { app, server };
