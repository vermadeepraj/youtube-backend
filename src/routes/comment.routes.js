import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect comment routes
router.use(verifyJWT);

// Get comments for a video (with pagination)
router.route("/:videoId").get(getVideoComments);

// Add comment to a video
router.route("/:videoId").post(addComment);

// Update comment by ID
router.route("/:commentId").put(updateComment);

// Delete comment by ID
router.route("/:commentId").delete(deleteComment);

export default router;
