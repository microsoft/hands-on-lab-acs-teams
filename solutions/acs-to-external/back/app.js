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

const app = express();

// DI
const storage = inMemory();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up CORS options
const corsOptions = {
  origin: (origin, callback) => {
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

/** purpose: Returns a random user with a token */
app.use("/token", issueToken);

/** purpose: Returns the ACS endpoint URL */
app.use("/getEndpointUrl", getEndpointUrl);

/** purpose: Returns the first registered phone number in the system */
app.use("/phone", getPhoneNumber);

/** purpose: Identify a user based on their email. Optionally registers them */
app.use("/login", identifyUserFactory(storage));

// NOTE : Not to be moved to the top, routes must be declared before the default route
app.use("/", (req, res) => {
  res.status(200);
  res.end("Everything is OK, but there is nothing to see here");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

export default app;
app.on("error", console.error);
app.listen(8080, () => console.log("Server running on port 8080"));
