export async function getToken() {
  const response = await fetch(`${process.env.BACKEND_URL}/token`);
  const data = await response.json();
  return data.token;
}

export async function getEndpointUrl() {
  const response = await fetch(`${process.env.BACKEND_URL}/getEndpointUrl`);
  const data = await response.json();
  return data.endpoint;
}
