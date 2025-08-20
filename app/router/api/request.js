import { Router } from "express";
import { checkLoginStatus } from "../../middleware/checkAuth.js";
import { profileUpload, videoUpload } from "../../middleware/multer.js";
import * as requestController from "../../controllers/requestController.js";

const router = Router();

router.get("/status", checkLoginStatus, requestController.fetchProfileStatus);
router.patch("/status", checkLoginStatus, requestController.updateProfileStatus);

router.get("/profile", checkLoginStatus, requestController.fetchProfile);
router.post(
  "/profile",
  checkLoginStatus,
  profileUpload.single("profilePhoto"),
  requestController.saveProfile
);

router.post(
  "/video",
  checkLoginStatus,
  videoUpload.single("video"),
  requestController.uploadVideo
);

router.patch("/video/:section", requestController.updateVideoData);

export default router;
