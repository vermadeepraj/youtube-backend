import express from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all playlist routes with JWT middleware
router.use(verifyJWT);

// Create a new playlist
router.post("/", createPlaylist);

// Get all playlists of a specific user (paginated & searchable)
router.get("/user/:userId", getUserPlaylists);

// Get a single playlist by ID
router.get("/:playlistId", getPlaylistById);

// Add a video to a playlist
router.post("/:playlistId/video/:videoId", addVideoToPlaylist);

// Remove a video from a playlist
router.delete("/:playlistId/video/:videoId", removeVideoFromPlaylist);

// Update playlist metadata (name, description)
router.put("/:playlistId", updatePlaylist);

// Delete a playlist
router.delete("/:playlistId", deletePlaylist);

export default router;