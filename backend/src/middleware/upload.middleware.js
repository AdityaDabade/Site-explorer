const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(
  __dirname,
  "..",
  "..",
  process.env.UPLOAD_DIR || "src/uploads"
);

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadRoot);
  },
  filename(req, file, cb) {
    const sanitizedName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav"
];

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Unsupported file type for story upload."));
  }
});

module.exports = {
  upload
};
