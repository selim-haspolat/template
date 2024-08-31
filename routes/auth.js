import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { createError } from "../utils/error.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    const userWithEmail = await User.findOne({ email });
    const userWithUserName = await User.findOne({ userName });

    if (userWithEmail || userWithUserName) {
      return res.status(400).json({
        success: false,
        msg: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 11);

    const newUser = new User({
      userName,
      email,
      password: hash,
    });

    await newUser.save();
    const { password: userPassword, isAdmin, ...otherDetail } = newUser._doc;

    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(201)
      .json({
        success: true,
        data: otherDetail,
      });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ userName: userName });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isPaswordValid = await bcrypt.compare(password, user.password);
    if (!isPaswordValid) {
      return next(createError(401, "Password is not correct"));
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT,
      {
        expiresIn: "365d", // expires in 365 days
      }
    );

    const { password: userPassword, isAdmin, ...otherDetail } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ success: true, data: otherDetail });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({ success: true, msg: "Logged out" });
  } catch (error) {
    next(error);
  }
});

export default router;
