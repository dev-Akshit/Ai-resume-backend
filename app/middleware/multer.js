import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profilePhoto") {
      cb(null, path.join(uploadDir, "profiles"));
    } else if (file.fieldname === "video") {
      cb(null, path.join(uploadDir, "videos"));
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === "profilePhoto") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed for profilePhoto"), false);
    }
  } else if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files allowed for video uploads"), false);
    }
  } else {
    cb(new Error("Invalid field"), false);
  }
}

export const profileUpload = multer({ storage, fileFilter });
export const videoUpload = multer({ storage, fileFilter });
