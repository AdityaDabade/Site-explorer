const express = require("express");

const { getFeedback, submitFeedback } = require("../controllers/feedback.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", optionalAuth, submitFeedback);
router.get("/", getFeedback);

module.exports = router;
