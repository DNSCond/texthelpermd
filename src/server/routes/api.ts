import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';

export const api = new Hono();

api.post('/posts', async c => {
  try {
    const { textarea, title } = await c.req.json();
    const post = await reddit.submitPost({
        title, text: textarea,
        subredditName: context.subredditName,
        runAs: 'USER',
      });
    return c.json({ permalink: post.permalink }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: String(error) }, 500);
  }
});
