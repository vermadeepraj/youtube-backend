import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser, 
  refreshAccessToken, 
  changeCurrentPassword, 
  getCurrentUser, 
  updateAccountDetails, 
  updateUserAvatar, 
  updateUserCoverImage,
  getUserChannelProfile, 
  getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },//two file accept kar rha hu , cover image and avatar
    {
      name: "coverImage",
      maxCount: 1,
    }
  ]),
  registerUser)
// router.post('/register', registerUser)

//secured route
router.route("/login").post(loginUser)

router.route("/refreshToken").post(refreshAccessToken)

//SECURED ROUTES
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)    //for params

router.route("/history").get(verifyJWT, getWatchHistory)

export default router; 