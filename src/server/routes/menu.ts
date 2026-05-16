import { Hono } from 'hono';
import type { UiResponse, MenuItemRequest } from '@devvit/web/shared';
import { context, reddit } from '@devvit/web/server';

export const menu = new Hono;
menu.post('/post-create', async (c) => {
  try {
    const post = await reddit.submitCustomPost({ title: 'texthelpermd' });
    return c.json<UiResponse>({ navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}` }, 200);
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<UiResponse>({ showToast: 'Failed to create post' }, 500);
  }
});

menu.post('/post', async (c) => {
  return c.json<UiResponse>({
    showForm: {
      name: 'postText',
      form: {
        title: 'Post',
        acceptLabel: 'Post',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
           required: true,
          },
          {
            type: 'paragraph',
            name: 'postText',
            label: 'Post Text',
            helpText: 'write your text in markdown, if you leave the app remember to copy to clipboard as the form may refresh due to Reddit.',
            lineHeight: 30,
            required: true,
          },
        ],
      },
    },
  });
});

menu.post('start-workflow', async c => {
  const contextItem = await c.req.json<MenuItemRequest>();
  console.log(contextItem.targetId);
  return c.json<UiResponse>({
    showForm: {
      name: 'commentText',
      form: {
        title: 'Comment',
        acceptLabel: 'Comment',
        description: 'Reply-To',
        fields: [
          {
            type: 'string',
            name: 'replyTo',
            label: 'Reply-To',
            helpText: 'prepopulated, do not edit unless you know what you are doing. is a reddit id',
            required: true,
          },
          {
            type: 'paragraph',
            name: 'commentText',
            label: 'Comment Text',
            helpText: 'write your text in markdown, if you leave the app remember to copy to clipboard as the form may refresh due to Reddit.',
            lineHeight: 30,
            required: true,
          },
        ],
      },
      data: { replyTo: contextItem.targetId },
    },
  });
});
