import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect tweet routes
router.use(verifyJWT);

// Create a tweet
router.route("/").post(createTweet);

// Get all tweets of logged-in user
router.route("/user").get(getUserTweets);

// Update tweet by ID
router.route("/:tweetId").put(updateTweet);

// Delete tweet by ID
router.route("/:tweetId").delete(deleteTweet);

export default router;
