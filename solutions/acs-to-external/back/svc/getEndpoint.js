import { env } from "process";
export function getEndpoint() {
  return env.ACS_CONNECTION_STRING.match(/(?<=endpoint=)[^;]+/)?.[0];
}
