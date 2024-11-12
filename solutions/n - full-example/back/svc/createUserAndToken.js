import { env } from "node:process";
import { CommunicationIdentityClient } from "@azure/communication-identity";
/**
 * Create a new ACS user and the associated token
 * @param {*} scopes. Will be ['chat', 'voip'] by default
 * @returns
 */
export async function createUserAndToken(scopes) {
  const client = new CommunicationIdentityClient(env["ACS_CONNECTION_STRING"]);
  return client.createUserAndToken(scopes);
}