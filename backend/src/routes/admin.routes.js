const express = require("express");

const {
  getAdminStats,
  getPendingContent,
  getUsers,
  reviewContent,
  updateUser
} = require("../controllers/admin.controller");
const { adminOnly, protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/content/pending", getPendingContent);
router.put("/content/:id", reviewContent);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);

module.exports = router;
