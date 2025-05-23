import express from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware to verify JWT for protected routes
router.use(verifyJWT);

// Route to subscribe or unsubscribe a user from a channel
router.post("/:channelId", toggleSubscription);

// Route to get all subscribers for a channel
router.get("/subscribers/:channelId", getUserChannelSubscribers);

// Route to get all channels to which a user has subscribed
router.get("/subscriptions/:subscriberId", getSubscribedChannels);

export default router;
