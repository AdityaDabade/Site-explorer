const mongoose = require("mongoose");

const ChatSession = require("../models/ChatSession");
const HeritagePlace = require("../models/HeritagePlace");
const Place = require("../models/Place");
const asyncHandler = require("../utils/asyncHandler");
const { emitGuideNarration } = require("../config/socket");
const { generateChatReply, syncChatSessionToVectorDb } = require("../services/aiContent.service");
const { failure, success } = require("../utils/response");

const sendMessage = asyncHandler(async (req, res) => {
  const {
    place_id: placeId,
    geofence_zone: geofenceZone,
    zone = "general",
    message,
    current_page: currentPage,
    user_location: userLocation,
    selected_place: selectedPlace
  } = req.body;
  const activeZone = geofenceZone || zone;

  if (!message) {
    return failure(res, 400, "message is required.");
  }

  const placeQuery = !placeId
    ? null
    : mongoose.Types.ObjectId.isValid(placeId)
      ? { _id: placeId }
      : { $or: [{ place_id: placeId }, { slug: placeId }] };
  const place = placeQuery
    ? await Place.findOne(placeQuery) ||
      await HeritagePlace.findOne(
        mongoose.Types.ObjectId.isValid(placeId)
          ? { $or: [{ _id: placeId }, { place_id: placeId }, { slug: placeId }] }
          : { $or: [{ place_id: placeId }, { slug: placeId }] }
      )
    : null;

  const existingSession = req.user
    ? await ChatSession.findOne({
        user: req.user._id,
        place: place?._id || null
      }).sort({ updatedAt: -1 })
    : null;

  const session =
    existingSession ||
    new ChatSession({
      user: req.user?._id || null,
      place: place?._id || null,
      zone: activeZone,
      messages: []
    });

  session.zone = activeZone;
  session.messages.push({
    role: "user",
    content: message
  });

  const aiResult = await generateChatReply({
    place: place ? place.toJSON() : null,
    placeId: place ? place.place_id || place.id : placeId,
    zone: activeZone,
    message,
    history: session.messages,
    currentPage: currentPage || (place ? "Place" : "Home"),
    userLocation,
    selectedPlace: place ? null : selectedPlace
  });

  session.messages.push({
    role: "assistant",
    content: aiResult.reply
  });
  session.summary = aiResult.caption || aiResult.reply;
  await session.save();

  const vectorSync = await syncChatSessionToVectorDb(session);

  if (vectorSync.synced) {
    session.vector_synced = true;
    session.vector_document_id = vectorSync.vector_document_id || "";
    await session.save();
  }

  if (req.user?.id) {
    emitGuideNarration(req.user.id, {
      place_id: place ? place.place_id || place.id : null,
      caption: aiResult.caption || aiResult.reply,
      text: aiResult.reply
    });
  }

  return success(res, {
    sessionId: session.id,
    reply: aiResult.reply,
    text: aiResult.text || aiResult.reply,
    caption: aiResult.caption || aiResult.reply,
    vector_synced: vectorSync.synced,
    source: aiResult.source
  });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const placeQuery = mongoose.Types.ObjectId.isValid(req.params.placeId)
    ? { _id: req.params.placeId }
    : { place_id: req.params.placeId };
  const place = await Place.findOne(placeQuery);

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  const sessions = await ChatSession.find({
    place: place._id,
    ...(req.user ? { user: req.user._id } : {})
  }).sort({ updatedAt: -1 });

  const messages = sessions.flatMap((session) => session.messages);

  return success(res, {
    history: messages,
    total: messages.length
  });
});

module.exports = {
  getChatHistory,
  sendMessage
};
