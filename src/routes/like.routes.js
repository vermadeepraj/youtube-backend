import { express } from "express";
import { get } from "mongoose";
import {
  likeContent,
  unlikeContent,
  getLikeForContent,
  checkIfUserLikedContent
} from "../controllers/like.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.router();

//secure routes
router.use(verifyJWT);

router.post("/like", likeContent);
router.post("/unlike", unlikeContent)
router.get("/likes", getLikeForContent)
router.get("/check-like", checkIfUserLikedContent)

export default router