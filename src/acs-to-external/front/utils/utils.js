// @ts-check
import "./types.js";

/**
 * Returns the a new ACS user token
 * @returns {Promise<{token: string, expiresOn: string, user: {communicationUserId} }>} - The token as string
 */
export async function randomAuth() {
  const response = await fetch(`${process.env.BACKEND_URL}/token`);
  return response.json();
}

/**
 *  Returns the ACS endpoint URL
 * @returns {Promise<string>} - The endpoint as string
 */
export async function getEndpointUrl() {
  const response = await fetch(`${process.env.BACKEND_URL}/getEndpointUrl`);
  const data = await response.json();
  return data.endpoint;
}

/**
 *  Returns the first matched ACS phone number
 * @returns {Promise<string>} - The phone number as string
 */
export async function getPhoneNumber() {
  const response = await fetch(`${process.env.BACKEND_URL}/phone`);
  const data = await response.json();
  return data.number;
}

/**
 * Attempts to identify a user based on their email
 * @param {string} email - The email of the user to identify
 * @returns {Promise<User>} - The ACS ID of the user and whether the user was created
 */
export async function login(email = "", opt = { upsert: false }) {
  const response = await fetch(`${process.env.BACKEND_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.assign({ email }, opt)),
  });
  return response.json();
}
