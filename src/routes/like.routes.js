import { Router } from "express";
import {
  likeContent,
  unlikeContent,
  getLikeForContent,
  checkIfUserLikedContent,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all routes with JWT middleware
router.use(verifyJWT);

// Like content
router.route("/like").post(likeContent);

// Unlike content
router.route("/unlike").post(unlikeContent);

// Get likes for content
router.route("/likes").get(getLikeForContent);

// Check if user liked content
router.route("/check-like").get(checkIfUserLikedContent);

export default router;
