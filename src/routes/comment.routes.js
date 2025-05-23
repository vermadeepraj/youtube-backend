import express from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all comment routes with JWT verification middleware
router.use(verifyJWT);

// Route to get all comments for a specific video (paginated)
router.get("/:videoId", getVideoComments);

// Route to add a new comment to a video
router.post("/:videoId", addComment);

// Route to update a specific comment by ID
router.put("/:commentId", updateComment);

// Route to delete a specific comment by ID
router.delete("/:commentId", deleteComment);

export default router;
