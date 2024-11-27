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
  //TODO
}
