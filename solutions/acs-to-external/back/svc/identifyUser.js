import { createUserAndToken } from "./createUserAndToken.js";
/**
 * @typedef { import("../storage/storage").Storage } Storage
 */

/**
 * Identify a user based on their email
 * @param {Storage} backend The storage backend to use
 * @param {string} email. The email of the user to identify
 * @returns {Promise<{ acsId: string, token: string, created: boolean }>} The ACS ID of the user and whether the user was created
 */
export async function identifyUser(backend, email) {
  let exists = backend.has(email);
  const payload = { acsId: "", token: "default", created: !exists };

  if (!exists) {
    const { user, token } = await createUserAndToken(["chat", "voip"]);
    backend.set(email, { user, token });
  }

  const { user, token } = backend.get(email);
  payload.acsId = user.communicationUserId;
  payload.token = token;
  return payload;
}
