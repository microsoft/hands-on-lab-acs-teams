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
  // TODO
}
