const path = require('path');
const fs = require('fs');
const multer = require('multer');

const isServerless = Boolean(process.env.VERCEL);
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

let storage;
if (isServerless) {
  // Vercel's filesystem is read-only; keep uploaded avatars in memory
  storage = multer.memoryStorage();
} else {
  const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.png';
      cb(null, `avatar-${req.user._id}-${Date.now()}${safeExt}`);
    },
  });
}

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error('Only JPEG, PNG, WEBP, and GIF image files are allowed');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: isServerless ? 1 * 1024 * 1024 : 2 * 1024 * 1024,
  },
});

module.exports = { uploadAvatar };
