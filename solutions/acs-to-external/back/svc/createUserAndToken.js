import { env } from "node:process";
import { CommunicationIdentityClient } from "@azure/communication-identity";
/** @typedef {typeof import('@azure/communication-identity').CommunicationUserToken} CommunicationUserToken */

/**
 * Create a new ACS user and the associated token
 * @param {string[]} scopes. Will be ['chat', 'voip'] by default
 * @returns {Promise<CommunicationUserToken>} The token with the specified scopes
 */
export async function createUserAndToken(scopes) {
  const client = new CommunicationIdentityClient(env["ACS_CONNECTION_STRING"]);
  return client.createUserAndToken(scopes);
}
