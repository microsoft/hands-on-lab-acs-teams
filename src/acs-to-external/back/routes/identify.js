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
      return req.query.email;
    case "POST":
      return req.body.email;
    default:
      return null;
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

    try {
      const payload = await identifyUser(backend, emailAddress);
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
