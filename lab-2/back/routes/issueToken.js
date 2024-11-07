import express from "express";
import { createUserAndToken } from "../svc/createUserAndToken.js";

const router = express.Router();

/** @typedef {typeof import('@azure/communication-identity').CommunicationUserToken} CommunicationUserToken */
/**
 * handleUserTokenRequest will return a default scoped token if no scopes are provided.
 * @param {string} [requestedScope] - optional string from the request, should be a comma-separated list of scopes.
 * @returns {Promise<CommunicationUserToken>} - Token with specified scopes.
 */
const handleUserTokenRequest = async (requestedScope) => {
  const scopes = requestedScope ? requestedScope.split(",") : ["chat", "voip"];
  return createUserAndToken(scopes);
};

/**
 * route: /token/
 *
 * purpose: To get Azure Communication Services token with the given scope.
 *
 * @param scope: scope for the token as string
 *
 * @returns The token as string
 *
 * @remarks
 * By default, the get and post routes will return a token with scopes ['chat', 'voip'].
 * Optionally, ?scope can be passed in containing scopes separated by commas
 * e.g. ?scope=chat,voip
 *
 */
router.get("/", async (req, res, next) => {
  try {
    const token = await handleUserTokenRequest(req.query.scope || "");
    res.send(token);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const token = await handleUserTokenRequest(req.body.scope || "");
    res.send(token);
  } catch (error) {
    next(error);
  }
});

export default router;
