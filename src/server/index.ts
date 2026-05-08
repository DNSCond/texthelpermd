/*
this is a generic server setup i have at https://github.com/DNSCond/historyhiders

try not to change much here.

all you have to do is add `export const router: Router = express.Router();` to your touter files and import that router here and add `app.use(router);`.

*/
import express from "express";
import {createServer, getServerPort} from "@devvit/web/server";
import {router} from "./logic";import {router as internal} from "./internal-logic";

const app = express();

app.use(express.raw({type: "application/protobuf"}));
// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({extended: true}));
// Middleware for plain text body parsing
app.use(express.text());

// connect your routers to you express app.
app.use(router);
app.use(internal);

const server = createServer(app);
server.on("error", (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
