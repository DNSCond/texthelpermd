import { context, reddit, redis, media } from '@devvit/web/server';
import { redisCompressed } from '@devvit/redis';
import { v4 as uuidv4 } from 'uuid';
import { Hono } from 'hono';

export const api = new Hono;

api.post('/posts', async c => {
  try {
    const { textarea, title, imageHrefs, flair, action } = await c.req.json(),
      imageUrls = imageHrefs?.split(/\s+/g);
    let post;
    const options: any = {
      subredditName: context.subredditName,
      runAs: 'USER', title, text: textarea,
    };
    console.log('action', action);
    if (flair !== 'Favicond-none' && flair !== 'on') {
      options.flairId = flair;
    }
    if (action === 'draft') {
      options.draftedAt = new Date;
      await redisCompressed.hSet(`drafts-${context.userId}`, {
        [uuidv4()]: JSON.stringify(options),
      });
      await redisCompressed.expire(`drafts-${context.userId}`, 60 * 60 * 24 * 14);
      return c.json({ toasted: 'saved to user drafts' }, 200);
    } else if (imageUrls?.length) {
      Object.assign(options, { imageUrls, kind: 'image' });
    }
    post = await reddit.submitPost(options);
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

api.get('/user-drafts', async c => {
  let result = {
    drafts: context.userId ? await redisCompressed.hGetAll(`drafts-${context.userId}`) : null,
  };
  return c.json(result, 200);
});

api.get('/flairs', async c => {
  const result = { flairs: Array(0) }, sub = await reddit.getCurrentSubreddit();
  const isMod = Boolean((await reddit.getModerators(context).all()).length);
  if (sub.usersCanAssignPostFlairs) {
    for (const flair of await reddit.getPostFlairTemplates(context.subredditName)) {
      if (!isMod) if (flair.modOnly) continue;
      result.flairs.push({
        modOnly: flair.modOnly,
        flair_template_id: flair.id,
        color: flair.backgroundColor,
        theme: flair.textColor,
        text: flair.text,
      });
    }
  }
  return c.json(result, 200);
});
