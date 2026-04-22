const express = require("express");

const { getFeedback, submitFeedback } = require("../controllers/feedback.controller");
const { adminOnly, optionalAuth, protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", optionalAuth, submitFeedback);
router.get("/", protect, adminOnly, getFeedback);

module.exports = router;
