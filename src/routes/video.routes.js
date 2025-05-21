import { express } from "express";
import { registerVideo,
getAllVideos,
getVideo,
updateVideo,
deleteVideo } from "../controllers/video.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import {upload} from "../middlewares/multer.middleware"

const router = express.Router()
//Middleware to verify JWT for protected routes
router.use(verifyJWT);

//ROUTES to register a video
router.post(
  "/register",
  upload.fields([
    { name: "videoFile", maxCount: 1 }, // Field for video file
    { name: "thumbnail", maxCount: 1 }, // Field for thumbnail
  ]),
  registerVideo
);

// Route to get a single video by ID
router.get("/:id", getVideo);

// Route to update video details
router.put(
  "/:id",
  upload.fields([
    { name: "videoFile", maxCount: 1 }, // Optional field for video file
    { name: "thumbnail", maxCount: 1 }, // Optional field for thumbnail
  ]),
  updateVideo
);

// Route to delete a video by ID
router.delete("/:id", deleteVideo);

// Route to get al l videos (with pagination and search)
router.get("/", getAllVideos);

export default router;