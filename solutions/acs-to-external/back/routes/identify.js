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
 * @returns
 */
function identifyUserFactory(backend) {
  return async (req, res, next) => {
    const emailAddress = parseEmail(req);
    if (!emailAddress) {
      res.status(400).send("Missing email");
      return;
    }
    const opt = parseOptions(req);
    try {
      const payload = await identifyUser(backend, emailAddress, opt);
      if (!payload) {
        res.status(404).send("User not found");
        return;
      }
      res.cookie("email", emailAddress);
      res.send(payload);
    } catch (error) {
      next(error);
    }
  };
}

export default (backend) => {
  /**
   * route: /login/
   * purpose: Identify a user based on their email
   * @param email: The email of the user to identify
   * @returns The ACS ID of the user and whether the user was created
   */
  // This GET route is only for debuging
  router.get("/", identifyUserFactory(backend));
  router.post("/", identifyUserFactory(backend));
  return router;
};
