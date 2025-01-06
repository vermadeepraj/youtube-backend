import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount:1
    },//two file accept kar rha hu , coverimage and avatar
    {
      name: "coverImage",
      maxCount:1,
    }
  ]),
registerUser)
// router.post('/register', registerUser)

export default router; 