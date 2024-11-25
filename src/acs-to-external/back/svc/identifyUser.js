import { createUserAndToken } from "./createUserAndToken.js";
/**
 * @typedef { import("../storage/storage").Storage } Storage
 */

/**
 * Identify a user based on their email
 * @param {Storage} backend The storage backend to use
 * @param {string} email. The email of the user to identify
 * @param {{upsert: boolean}} opt Options for the operation, upsert will create the user if it doesn't exist. Default is false
 * @returns {Promise<{ acsId: string, token: string, created: boolean, email: string } | null >} User object
 */
export async function identifyUser(backend, email, opt = { upsert: false }) {
  let exists = backend.has(email);
  if (!exists && !opt.upsert) {
    return null;
  }

  const payload = { acsId: "", token: "default", created: !exists, email };
  if (!exists) {
    const { user, token } = await createUserAndToken(["chat", "voip"]);
    backend.set(email, { user, token });
  }

  const { user, token } = backend.get(email);
  payload.acsId = user.communicationUserId;
  payload.token = token;
  return payload;
}
