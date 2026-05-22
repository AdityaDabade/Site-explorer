const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const MODEL_NAME = "models/gemini-flash-latest";

console.log("KEY:", process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");
console.log("MODEL:", MODEL_NAME);

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: MODEL_NAME
  });
}

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  if (typeof genAI.listModels === "function") {
    return genAI.listModels();
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const models = await response.json();

  if (!response.ok) {
    throw new Error(models?.error?.message || "Unable to list Gemini models.");
  }

  return models;
}

router.get("/list-models", async (req, res) => {
  try {
    const models = await listGeminiModels();
    console.log("Gemini Models:", JSON.stringify(models, null, 2));
    return res.json(models);
  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({ error: "failed", details: err.message });
  }
});

router.get("/test-gemini", async (req, res) => {
  try {
    const model = getGeminiModel();
    const prompt = "Say hello";
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return res.json({ text });
  } catch (err) {
    console.error("FULL ERROR:", err);
    console.error("Gemini Error:", err.message);
    return res.status(500).json({ error: "failed" });
  }
});

router.post(
  "/ai-guide",
  asyncHandler(async (req, res) => {
    const { place_name: placeName, message } = req.body || {};

    if (!placeName || !message) {
      return res.status(400).json({ message: "place_name and message are required." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      return res.status(503).json({
        message: "Gemini API key is not configured."
      });
    }

    const model = getGeminiModel();

    const prompt = `You are a smart travel guide.

Place: ${placeName}
User query: ${message}

Give helpful, short, engaging response.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) {
      return res.status(502).json({ message: "Gemini did not return a response." });
    }

    return res.json({
      text
    });
  })
);

module.exports = router;
