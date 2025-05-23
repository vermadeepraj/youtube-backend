import express from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protecting routes with JWT authentication
router.use(verifyJWT);

// Route to get channel stats (total videos, views, likes, subscribers)
router.get("/:channelId/stats", getChannelStats);

// Route to get all videos uploaded by the channel
router.get("/:channelId/videos", getChannelVideos);

export default router;
