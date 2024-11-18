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
import getPhoneNumber from "./routes/getPhoneNumber.js";
import identifyUserFactory from "./routes/identify.js";
import { inMemory } from "./storage/inMemory.js";
import cookieParser from "cookie-parser";
// import refreshToken from './routes/refreshToken.js';
// import getEndpointUrl from './routes/getEndpointUrl.js';
// import userConfig from './routes/userConfig.js';
// import createThread from './routes/createThread.js';
// import addUser from './routes/addUser.js';
// import createRoom from './routes/createRoom.js';
// import addUserToRoom from './routes/addUserToRoom.js';

const app = express();

// DI
const storage = inMemory();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow requests from any localhost origin
    if (origin.startsWith("http://localhost")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

// Use CORS middleware with options
app.use(cors(corsOptions));

app.use(logger("tiny"));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, "build")));
app.use("/favicon.ico", (req, res) => {
  res.status(204);
});

/**
 * route: /token
 * purpose: Chat,Calling: get ACS token with the given scope
 */
app.use("/token", issueToken);

app.use("/getEndpointUrl", getEndpointUrl);

app.use("/phone", getPhoneNumber);

app.use("/login", identifyUserFactory(storage));

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
