import express from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware to verify JWT for protected routes
router.use(verifyJWT);

// Route to create a new tweet
router.post("/", createTweet);

// Route to get all tweets of a specific user
router.get("/user", getUserTweets);

// Route to update a specific tweet by ID
router.put("/:tweetId", updateTweet);

// Route to delete a specific tweet by ID
router.delete("/:tweetId", deleteTweet);

export default router;
