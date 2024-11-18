import { Router } from "express";
import { identifyUser } from "../svc/identifyUser.js";

const router = Router();

/**
 * @typedef { import("../storage/storage").Storage } Storage
 */

/**
 * Parse the email from the request
 * @param {Express.Request} req
 * @returns {string | null} The email from the request
 */
function parseEmail(req) {
  switch (req.method) {
    case "GET":
      return req.cookies?.email ?? req.query?.email;
    case "POST":
      return req.cookies?.email ?? req.body.email;
    default:
      return null;
  }
}

/**
 * Parse the options from the request
 * @param {Express.Request} req
 * @returns {{upsert: boolean}} The options from the request
 */
function parseOptions(req) {
  switch (req.method) {
    case "GET":
      return { upsert: req.query?.upsert == "true" };
    case "POST":
      return { upsert: req.body?.upsert == true };
    default:
      return {};
  }
}

/**
 * The hackiest DI I've ever made
 * @param {Storage} backend
 *
 */
function authBuilder(backend) {
  return async (req, res, next) => {
    const mail = parseEmail(req);
    if (!mail) {
      res.status(400).send("Missing email");
      return;
    }

    let user;
    try {
      user = await identifyUser(backend, mail, parseOptions(req));
    } catch (err) {
      next(err);
    }

    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    // If the auth is successful, also return a cookie with the mail
    // This is used to identify the user in the future
    res.cookie("email", mail);
    res.send(user);
  };
}

export default (backend) => {
  /**
   * route: /login/
   * purpose: Identify a user based on their email
   */
  // This GET route is only for debuging
  router.get("/", authBuilder(backend));
  router.post("/", authBuilder(backend));
  return router;
};
