import { Hono } from 'hono';
import { context, reddit, redis, media } from '@devvit/web/server';

export const api = new Hono();

api.post('/posts', async c => {
  try {
    const { textarea, title, imageHrefs } = await c.req.json(), imageUrls = imageHrefs?.split(/\s+/g);
    console.log(imageUrls, imageHrefs);
    const post = await reddit.submitPost({
      subredditName: context.subredditName,
      imageUrls, runAs: 'USER',
      title, text: textarea,
      kind: 'image',
    });
    return c.json({ permalink: post.permalink }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: String(error) }, 500);
  }
});

api.post('/image/upload', async c => {
  try {
    const uuid = c.req.query('uuid'), index = c.req.query('index')!;
    if (!/^\d+$/.test(index!)) return c.text('Missing index', 400);
    if (!uuid) return c.text('Missing uuid', 400);
    const base64 = Buffer.from(await c.req.arrayBuffer()).toString('base64');
    await redis.hSet(uuid, { [index]: base64 });
    await redis.expire(uuid, 30);
    return c.json({}, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: String(error) }, 500);
  }
});
api.post('/image/finalize', async c => {
  try {
    const uuid = c.req.query('uuid'), length = c.req.query('length')!;
    if (!/^\d+$/.test(length!)) return c.text('Missing index', 400);
    if (!uuid) return c.text('Missing uuid', 400);
    const array = await redis.hGetAll(uuid) as any;
    array.length = +length;
    const arrays = btoa(Array.from(array, (b64: string) => atob(b64)).join(String())),
      { mediaUrl } = await media.upload({ url: `data:image/png;base64,${arrays}`, type: 'image' });
    return c.json({ mediaUrl }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: String(error) }, 500);
  }
});

api.get('/currentUser', async c => {
  const { username, subredditName } = context;
  let result = { currentUserIsCurrentlyBanned: false, isApprovedUser: false, isLoggedIn: false };
  if (username) {
    result.isLoggedIn = true;
    const options = { subredditName, username };
    result.currentUserIsCurrentlyBanned = Boolean((await reddit.getBannedUsers(options).all()).length);
    result.isApprovedUser = Boolean((await reddit.getApprovedUsers(options).all()).length);
  }
  return c.json(result, 200);
});
