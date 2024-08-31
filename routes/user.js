import express from "express";
import User from "../models/user.js";

import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/", verifyAdmin, async (req, res, next) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

export default router;