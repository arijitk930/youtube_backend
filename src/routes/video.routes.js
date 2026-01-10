import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

/* =======================
   PUBLIC ROUTES
   ======================= */

// Feed (public – works for guest & logged-in users)
router.route("/").get(getAllVideos);

// Watch video (public)
router.route("/:videoId").get(optionalAuth, getVideoById);

/* =======================
   PROTECTED ROUTES
   ======================= */

// Publish video
router.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

// Update / Delete video
router
  .route("/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo)
  .delete(verifyJWT, deleteVideo);

// Toggle publish status
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
