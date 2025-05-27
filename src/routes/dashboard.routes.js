import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect dashboard routes
router.use(verifyJWT);

// Get channel stats (videos, views, subscribers, likes)
router.route("/:channelId/stats").get(getChannelStats);

// Get videos uploaded by a channel (with pagination)
router.route("/:channelId/videos").get(getChannelVideos);

export default router;
