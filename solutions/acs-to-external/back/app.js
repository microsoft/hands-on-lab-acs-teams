// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import "dotenv-safe/config.js";
import express from "express";
import cors from "cors";
import createError from "http-errors";
import logger from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import issueToken from "./routes/issueToken.js";
import getEndpointUrl from "./routes/getEndpointUrl.js";
// import refreshToken from './routes/refreshToken.js';
// import getEndpointUrl from './routes/getEndpointUrl.js';
// import userConfig from './routes/userConfig.js';
// import createThread from './routes/createThread.js';
// import addUser from './routes/addUser.js';
// import createRoom from './routes/createRoom.js';
// import addUserToRoom from './routes/addUserToRoom.js';

const app = express();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger("tiny"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, "build")));
app.use("/favicon.ico", (req, res) => {
  res.status(204);
});

/**
 * route: /token
 * purpose: Chat,Calling: get ACS token with the given scope
 */
app.use("/token", cors(), issueToken);

app.use("/getEndpointUrl", cors(), getEndpointUrl);
// NOTE : Not to be moved to the top, routes must be declared before the default route
app.use("/", (req, res) => {
  res.status(200);
  res.end("Everything is OK, but there is nothing to see here");
});

/**
 * route: /addUser
 * purpose: Remem
 */
//app.use("/addUser", cors(), addUser);

// Uncomment the following routes as needed:

// app.use("/createThread", cors(), createThread);

// app.use("/refreshToken", cors(), refreshToken);
// app.use("/getEndpointUrl", cors(), getEndpointUrl);
// app.use("/userConfig", cors(), userConfig);

// app.use("/createRoom", cors(), createRoom);
// app.use("/addUserToRoom", cors(), addUserToRoom);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

export default app;
app.on("error", console.error);
app.listen(8080, () => console.log("Server running on port 8080"));
