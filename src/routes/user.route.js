import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJwT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwT, changeCurrentPassword);
router.route("/current-user").get(verifyJwT, getCurrentUser);
router.route("/update-account").patch(verifyJwT, updateAccountDetails);
router
  .route("/avatar")
  .patch(verifyJwT, upload.single("avatar"), updateUserAvatar);

router.route("/c/:username").get(verifyJwT, getUserChannelProfile);
router.route("/history").get(verifyJwT, getWatchHistory);

export default router;
