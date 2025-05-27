import { Router } from "express";
import {
  registerVideo,
  getAllVideos,
  getVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protect all routes with JWT middleware
router.use(verifyJWT);

// Create/register video with files upload
router.route("/register").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  registerVideo
);

// Get all videos (pagination & search)
router.route("/").get(getAllVideos);

// Get single video by ID
router.route("/:id").get(getVideo);

// Update video details and optionally upload new files
router.route("/:id").put(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateVideo
);

// Delete video by ID
router.route("/:id").delete(deleteVideo);

export default router;
