const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "models/gemini-flash-latest";

function getMlClient() {
  return axios.create({
    baseURL: process.env.ML_SERVICE_URL,
    timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS || 12000)
  });
}

async function postToMl(path, payload) {
  if (!process.env.ML_SERVICE_URL) {
    return null;
  }

  const response = await getMlClient().post(path, payload);
  return response.data?.data || response.data;
}

async function generateChatReply({ place, placeId, zone, message, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("Gemini API key is not configured.");
  }

  const placeName = place?.name || placeId || "the current place";
  console.log("PLACE:", placeName);
  console.log("MESSAGE:", message);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME
  });
  console.log("Using model:", MODEL_NAME);
  const prompt = `
You are a travel guide.

Place: ${placeName}
User: ${message}
 
Give short helpful answer.
`;

  try {
    const result = await model.generateContent(prompt);
    const replyText = result.response.text().trim();

    if (!replyText) {
      throw new Error("Gemini did not return a response.");
    }

    return {
      reply: replyText,
      caption: replyText,
      text: replyText,
      source: "gemini"
    };
  } catch (err) {
    console.error("FULL ERROR:", err);
    throw err;
  }
}

async function generatePlaceContent(place) {
  if (process.env.ML_SERVICE_URL) {
    try {
      const response = await postToMl("/places/generate", {
        place
      });

      return {
        ...response,
        source: "ml-service"
      };
    } catch (error) {
      console.warn("ML service place generation failed, using Gemini:", error.message);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME
  });
  console.log("Using model:", MODEL_NAME);
  const prompt = `You are a smart travel guide.

Create concise travel content for this place.
Place name: ${place.name}
City or location: ${place.city || place.location_name || ""}
Existing description: ${place.description || ""}

Return only JSON with this shape:
{
  "description": "short engaging description",
  "summary": "one short guide summary",
  "facts": ["fact one", "fact two", "fact three"]
}`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const generated = JSON.parse(jsonText);

  return {
    description: generated.description || "",
    summary: generated.summary || "",
    facts: Array.isArray(generated.facts) ? generated.facts : [],
    images: place.images || [],
    ar_model_url: place.ar_model_url || "",
    source: "gemini"
  };
}

async function estimateTripCost(payload) {
  if (!process.env.ML_SERVICE_URL) {
    return {
      total: 0,
      breakdown: {}
    };
  }

  try {
    const response = await postToMl("/cost/estimate", payload);

    return {
      total: Number(response?.total || response?.estimated_total || 0),
      breakdown: response?.breakdown || response || {}
    };
  } catch (error) {
    console.warn("ML trip cost call failed:", error.message);
    return {
      total: 0,
      breakdown: {}
    };
  }
}

async function recommendHotels(payload) {
  return postToMl("/recommend/hotels", payload);
}

async function recognizeLandmark(payload) {
  return postToMl("/recognize", payload);
}

async function syncChatSessionToVectorDb(session) {
  if (!process.env.VECTOR_DB_URL) {
    return {
      synced: false,
      reason: "VECTOR_DB_URL not configured"
    };
  }

  try {
    const response = await axios.post(
      `${process.env.VECTOR_DB_URL.replace(/\/$/, "")}/sessions/upsert`,
      {
        session_id: String(session._id),
        place_id: session.place ? String(session.place) : null,
        user_id: session.user ? String(session.user) : null,
        zone: session.zone,
        messages: session.messages
      },
      {
        timeout: 8000
      }
    );

    return {
      synced: true,
      vector_document_id: response.data?.id || response.data?.document_id || null
    };
  } catch (error) {
    console.warn("Vector DB sync failed:", error.message);
    return {
      synced: false,
      reason: error.message
    };
  }
}

module.exports = {
  generateChatReply,
  generatePlaceContent,
  estimateTripCost,
  recognizeLandmark,
  recommendHotels,
  syncChatSessionToVectorDb
};
