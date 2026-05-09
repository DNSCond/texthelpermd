import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { context, createServer, getServerPort, reddit } from '@devvit/web/server';
import type { UiResponse } from '@devvit/web/shared';
import { api } from './routes/api';

const app = new Hono();
const internal = new Hono();


app.route('/api', api);
app.route('/internal', internal);
const menu = new Hono();
export const createPost = async () => {
  return await reddit.submitCustomPost({
    title: 'texthelpermd',
  });
};

menu.post('/post-create', async (c) => {
  try {
    const post = await createPost();

    return c.json<UiResponse>(
      {
        navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      },
      200,
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>(
      {
        showToast: 'Failed to create post',
      },
      400,
    );
  }
});
serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
