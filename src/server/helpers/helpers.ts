// this is an helper found in https://github.com/reddit/devvit-template-bare/
// tis file can be safely deleted for your project
import { context } from "@devvit/web/server";

export function getPostId(): string {
  if (!context.postId) {
    throw Error("no post ID");
  }
  return context.postId;
}

export function getPostCountKey(postId: string): string {
  return `count:${postId}`;
}
