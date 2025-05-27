import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all subscription routes
router.use(verifyJWT);

// Toggle subscription (subscribe/unsubscribe)
router.route("/:channelId").post(toggleSubscription);

// Get subscribers list of a channel
router.route("/subscribers/:channelId").get(getUserChannelSubscribers);

// Get subscribed channels list of a subscriber
router.route("/subscriptions/:subscriberId").get(getSubscribedChannels);

export default router;
