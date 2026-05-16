import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { api } from './routes/api';
import { menu } from './routes/menu';
import { forms } from './routes/forms';

const app = new Hono;
const internal = new Hono;

app.route('/api', api);
internal.route('/menu', menu);
internal.route('/forms', forms);
app.route('/internal', internal);

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
