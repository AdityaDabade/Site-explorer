const axios = require("axios");

function getTtsClient() {
  return axios.create({
    baseURL: process.env.TTS_SERVICE_URL,
    timeout: Number(process.env.TTS_SERVICE_TIMEOUT_MS || 12000)
  });
}

async function generateSpeech(text) {
  if (!text) {
    return {
      audioUrl: "",
      provider: "none"
    };
  }

  if (process.env.TTS_SERVICE_URL) {
    try {
      const response = await getTtsClient().post("/tts", {
        text
      });

      return {
        audioUrl: response.data?.audio_url || response.data?.url || "",
        provider: "tts-service"
      };
    } catch (error) {
      console.warn("TTS service call failed, returning text-only response:", error.message);
    }
  }

  return {
    audioUrl: "",
    provider: "local-fallback"
  };
}

module.exports = {
  generateSpeech
};
