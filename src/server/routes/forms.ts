import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { reddit } from '@devvit/web/server';

export const forms = new Hono;

forms.post('commentText', async c => {
  const { ReplyTo, commentText } = await c.req.json();
  try {
    const comment = await reddit.submitComment({
      text: commentText, runAs: 'USER', id: ReplyTo,
    }), { permalink } = comment;
    return c.json<UiResponse>({ navigateTo: `https://www.reddit.com${permalink}` });
  } catch {
    return c.json<UiResponse>({ showToast: 'Devvit Error' });
  }
});
forms.post('postText', async c => {
  const { postText,title } = await c.req.json();
  try {
    const post = await reddit.submitPost({
      text: postText, runAs: 'USER',title
    }), { permalink } = post;
    return c.json<UiResponse>({ navigateTo: `https://www.reddit.com${permalink}` });
  } catch {
    return c.json<UiResponse>({ showToast: 'Devvit Error' });
  }
});
