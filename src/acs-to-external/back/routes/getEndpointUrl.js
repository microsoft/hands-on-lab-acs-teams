import express from "express";
import { getEndpoint } from "../svc/getEndpoint.js";
const router = express.Router();

/**
 * route: /getEndpointUrl/
 * purpose: Get the endpoint url of Azure Communication Services resource.
 * @returns The endpoint url as string
 */
router.get("/", function (_, res) {
  res.header("Content-Type", "application/json");
  res.send({ endpoint: getEndpoint() });
});

export default router;
