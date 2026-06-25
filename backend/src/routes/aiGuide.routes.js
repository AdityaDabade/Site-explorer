const express = require("express");
require("dotenv").config();

const asyncHandler = require("../utils/asyncHandler");
const {
  cleanAiDisplayText,
  generateAiGuideReply,
  getGeminiApiKey,
  getGeminiModel,
  logGeminiError,
  toGeminiPublicError
} = require("../services/aiContent.service");

const router = express.Router();

async function listGeminiModels() {
  const apiKey = getGeminiApiKey();

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const models = await response.json();

  if (!response.ok) {
    const error = new Error(models?.error?.message || "Unable to list Gemini models.");
    error.status = response.status;
    error.statusText = response.statusText;
    error.details = models?.error || models;
    throw error;
  }

  return models;
}

router.get("/list-models", async (req, res) => {
  try {
    const models = await listGeminiModels();
    console.log("Gemini Models:", JSON.stringify(models, null, 2));
    return res.json(models);
  } catch (err) {
    const publicError = err.publicMessage
      ? { statusCode: err.statusCode || 503, message: err.publicMessage }
      : toGeminiPublicError(err);
    logGeminiError("Gemini model list failed:", err);
    return res.status(publicError.statusCode).json({ error: "failed", message: publicError.message });
  }
});

router.get("/test-gemini", async (req, res) => {
  try {
    const model = getGeminiModel();
    const prompt = "Say hello";
    const result = await model.generateContent(prompt);
    const text = cleanAiDisplayText(result.response.text());

    return res.json({ text });
  } catch (err) {
    const publicError = err.publicMessage
      ? { statusCode: err.statusCode || 503, message: err.publicMessage }
      : toGeminiPublicError(err);
    logGeminiError("Gemini test failed:", err);
    return res.status(publicError.statusCode).json({ error: "failed", message: publicError.message });
  }
});

router.post(
  "/ai-guide",
  asyncHandler(async (req, res) => {
    const {
      current_page: currentPage = "Home",
      place_name: placeName,
      message,
      selected_place: selectedPlace,
      user_location: userLocation
    } = req.body || {};

    if (!message) {
      return res.status(400).json({ message: "message is required." });
    }

    let text = "";

    try {
      const result = await generateAiGuideReply({
        currentPage,
        userLocation,
        selectedPlace: selectedPlace || (placeName ? { name: placeName } : null),
        message
      });
      text = result.text;
    } catch (err) {
      const publicError = err.publicMessage
        ? { statusCode: err.statusCode || 503, message: err.publicMessage }
        : toGeminiPublicError(err);
      logGeminiError("Gemini guide failed:", err);
      return res.status(publicError.statusCode).json({ message: publicError.message });
    }

    if (!text) {
      return res.status(502).json({ message: "Gemini did not return a response." });
    }

    return res.json({
      text
    });
  })
);

module.exports = router;
