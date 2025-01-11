import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },//two file accept kar rha hu , coverimage and avatar
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

export default router; 