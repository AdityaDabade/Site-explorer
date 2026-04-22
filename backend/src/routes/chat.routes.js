const express = require("express");

const { getChatHistory, sendMessage } = require("../controllers/chat.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/message", optionalAuth, sendMessage);
router.get("/history/:placeId", optionalAuth, getChatHistory);

module.exports = router;
