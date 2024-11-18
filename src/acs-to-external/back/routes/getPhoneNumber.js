import { Router } from "express";
import { getFirstPhoneNumber } from "../svc/getPhoneNumber.js";

const router = Router();

router.get("/", async (_, res, next) => {
  try {
    res.send({ number: await getFirstPhoneNumber() });
  } catch (error) {
    next(error);
  }
});

export default router;
