/**
 * Returns the a new ACS user token
 * @returns {Promise<string>} - The token as string
 */
export async function getToken() {
  const response = await fetch(`${process.env.BACKEND_URL}/token`);
  const data = await response.json();
  return data.token;
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
