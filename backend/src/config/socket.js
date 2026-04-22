const jwt = require("jsonwebtoken");

let io;

function getAllowedOrigins() {
  return (process.env.FRONTEND_URL || process.env.CLIENT_URL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function initSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      return next();
    } catch (error) {
      return next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on("trip:join", (tripId) => {
      if (tripId) {
        socket.join(`trip:${tripId}`);
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet.");
  }

  return io;
}

function emitJobProgress(userId, payload) {
  if (!io || !userId) {
    return;
  }

  io.to(`user:${userId}`).emit("job:progress", {
    jobId: payload.jobId || null,
    percent: Number(payload.percent ?? payload.progress ?? 0),
    progress: Number(payload.progress ?? payload.percent ?? 0),
    status: payload.status || payload.label || "Processing",
    label: payload.label || payload.status || "Processing"
  });
}

function emitGuideNarration(userId, payload) {
  if (!io) {
    return;
  }

  const normalizedPayload = {
    place_id: payload.place_id || payload.placeId || null,
    placeId: payload.placeId || payload.place_id || null,
    audio_url: payload.audio_url || payload.audioUrl || "",
    audioUrl: payload.audioUrl || payload.audio_url || "",
    caption: payload.caption || "",
    text: payload.text || payload.caption || ""
  };

  if (userId) {
    io.to(`user:${userId}`).emit("guide:narration", normalizedPayload);
    return;
  }

  io.emit("guide:narration", normalizedPayload);
}

module.exports = {
  emitGuideNarration,
  emitJobProgress,
  getIO,
  initSocket
};
