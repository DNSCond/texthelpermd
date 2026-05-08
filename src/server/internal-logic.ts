// i remade a generic counter app by copying other templates.
// this file's contents can be safely deleted for your project
import type { Router } from "express-serve-static-core";
import express from "express";
import { OnAppInstallRequest, TriggerResponse, UiResponse } from "@devvit/web/shared";
import { ApiEndpoint } from "../shared/api";
import { context, reddit } from "@devvit/web/server";

// this is a router, to be used in src\server\logic.ts
export const router: Router = express.Router();

// if someone can tell me the menuitem request object type.
router.post<string, never, UiResponse>(ApiEndpoint.OnAppInstall, async (_req, res) => {
  const post = await reddit.submitCustomPost({ title: context.appName });
  res.status(200).json({
    showToast: { text: `Post ${post.id} created.`, appearance: "success" },
    navigateTo: post.url,
  });
});

router.post<string, never, TriggerResponse, OnAppInstallRequest>(ApiEndpoint.OnAppInstall, async (_req, res) => {
  await reddit.submitCustomPost({ title: "<% name %>", });
  res.status(200).json({});
});
