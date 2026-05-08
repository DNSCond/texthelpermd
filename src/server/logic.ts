// i remade a generic counter app by copying other templates.
// this file's contents can be safely deleted for your project
import type { Router } from "express-serve-static-core";
import express from "express";
// these imports are copied from https://github.com/reddit/devvit-template-bare/
import { context, redis } from "@devvit/web/server";
import {
  ApiEndpoint,
  type DecrementRequest,
  type DecrementResponse,
  type IncrementRequest,
  type IncrementResponse,
  type InitResponse,
} from "../shared/api";
import { getPostCountKey, getPostId } from "./helpers/helpers";

// this is a router, to be used in src\server\logic.ts
export const router: Router = express.Router();

// this is the IncrementRequest, for the counter app template.
router.post<string, never, IncrementResponse, IncrementRequest>(ApiEndpoint.Increment, async (req, res) => {
  try {
    const postId = getPostId();
    const amount = +req.body.amount;
    const incrementBy = Number.isFinite(amount) ? amount : 1;
    const count = await redis.incrBy(getPostCountKey(postId), +incrementBy);
    res.status(200).json({
      type: "increment",
      postId,
      count,
    });
  } catch (error) {
    res.status(500).json({
      type: "error500", error: String(error),
    } as any);
  }
});

// this is the DecrementRequest, for the counter app template.
router.post<string, never, DecrementResponse, DecrementRequest>(ApiEndpoint.Decrement, async (req, res) => {
  try {
    const postId = getPostId();
    const amount = +req.body.amount;
    const decrementBy = Number.isFinite(amount) ? amount : 1;
    const count = await redis.incrBy(getPostCountKey(postId), -decrementBy);
    res.status(200).json({
      type: "decrement",
      postId,
      count,
    });
  } catch (error) {
    res.status(500).json({
      type: "error500", error: String(error),
    } as any);
  }
});

// this is the InitResponse, for the counter app template.
router.get<string, never, InitResponse>(ApiEndpoint.Init, async (_req, res) => {
  try {
    const postId = getPostId();
    const count = Number((await redis.get(getPostCountKey(postId))) ?? 0);
    res.status(200).json({
      type: "init",
      postId,
      count,
      username: context.username ?? "[user]",
    });
  } catch (error) {
    res.status(500).json({
      type: "error500", error: String(error),
    } as any);
  }
});
