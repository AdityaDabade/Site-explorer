const cron = require("node-cron");
const Queue = require("bull");

const Place = require("../models/Place");
const { emitJobProgress } = require("../config/socket");
const { generatePlaceContent } = require("./aiContent.service");

let aiQueue = null;
let processorsRegistered = false;
let recurringJobsStarted = false;

function getQueue() {
  if (aiQueue || !process.env.REDIS_URL) {
    return aiQueue;
  }

  aiQueue = new Queue("tourvision-ai-jobs", process.env.REDIS_URL);

  aiQueue.on("error", (error) => {
    console.warn("Bull queue error:", error.message);
  });

  return aiQueue;
}

function registerProcessors() {
  const queue = getQueue();

  if (!queue || processorsRegistered) {
    return;
  }

  queue.process("generate-place-content", async (job) => {
    const place = await Place.findById(job.data.placeId);

    if (!place) {
      throw new Error("Place not found for queued AI generation.");
    }

    emitJobProgress(job.data.userId, {
      progress: 20,
      label: `Generating AI content for ${place.name}`
    });

    const content = await generatePlaceContent(place.toJSON());

    place.ai_content = {
      ...place.ai_content,
      ...content,
      status: place.ai_content?.status || "pending",
      updated_at: new Date()
    };
    place.has_ai_content = true;
    place.ai_content_available = true;
    await place.save();

    emitJobProgress(job.data.userId, {
      progress: 100,
      label: `AI content ready for ${place.name}`
    });

    return {
      placeId: String(place._id)
    };
  });

  processorsRegistered = true;
}

async function enqueuePlaceContentJob({ placeId, userId = null }) {
  const queue = getQueue();

  if (!queue) {
    const place = await Place.findById(placeId);

    if (!place) {
      throw new Error("Place not found for AI content generation.");
    }

    const content = await generatePlaceContent(place.toJSON());
    place.ai_content = {
      ...place.ai_content,
      ...content,
      status: place.ai_content?.status || "pending",
      updated_at: new Date()
    };
    place.has_ai_content = true;
    place.ai_content_available = true;
    await place.save();

    return {
      queued: false,
      mode: "inline"
    };
  }

  registerProcessors();
  await queue.add("generate-place-content", { placeId, userId }, { attempts: 2, removeOnComplete: 25 });

  return {
    queued: true,
    mode: "bull"
  };
}

async function refreshPendingAiContent() {
  const places = await Place.find({
    $or: [
      { has_ai_content: { $ne: true } },
      { "ai_content.status": { $in: ["pending", "draft", null] } }
    ]
  })
    .sort({ updatedAt: 1 })
    .limit(5);

  for (const place of places) {
    try {
      await enqueuePlaceContentJob({ placeId: place._id });
    } catch (error) {
      console.warn(`Failed to refresh AI content for ${place.name}:`, error.message);
    }
  }
}

function startRecurringJobs() {
  if (recurringJobsStarted) {
    return;
  }

  registerProcessors();

  cron.schedule(process.env.CRON_AI_REFRESH || "*/30 * * * *", () => {
    refreshPendingAiContent().catch((error) => {
      console.warn("Recurring AI refresh failed:", error.message);
    });
  });

  recurringJobsStarted = true;
}

module.exports = {
  enqueuePlaceContentJob,
  startRecurringJobs
};
