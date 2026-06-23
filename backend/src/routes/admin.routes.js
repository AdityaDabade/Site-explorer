const express = require("express");

const {
  createAlert,
  createPlace,
  deleteAlert,
  deleteFeedback,
  deleteMedia,
  deletePlace,
  deleteTrip,
  deleteUser,
  generateQr,
  getAlerts,
  getAnalytics,
  getFeedback,
  getMedia,
  getOverview,
  getPendingContent,
  getPlaces,
  getSettings,
  getTrips,
  getUserTrips,
  getUsers,
  reviewContent,
  updateAiGuide,
  updateAlert,
  updatePlace,
  updateSettings,
  updateUser,
  uploadMedia
} = require("../controllers/admin.controller");
const { adminOnly, protect } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/overview", getOverview);
router.get("/stats", getOverview);
router.get("/analytics", getAnalytics);

router.get("/users", getUsers);
router.get("/users/:id/trips", getUserTrips);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/places", getPlaces);
router.post("/places", createPlace);
router.put("/places/:id", updatePlace);
router.delete("/places/:id", deletePlace);
router.put("/places/:id/ai-guide", updateAiGuide);
router.post("/places/:id/qr", generateQr);

router.get("/trips", getTrips);
router.delete("/trips/:id", deleteTrip);

router.get("/content/pending", getPendingContent);
router.put("/content/:id", reviewContent);

router.get("/feedback", getFeedback);
router.delete("/feedback/:id", deleteFeedback);

router.get("/media", getMedia);
router.post(
  "/media",
  upload.fields([
    { name: "media", maxCount: 10 },
    { name: "files", maxCount: 10 }
  ]),
  uploadMedia
);
router.delete("/media", deleteMedia);

router.get("/alerts", getAlerts);
router.post("/alerts", createAlert);
router.put("/alerts/:id", updateAlert);
router.delete("/alerts/:id", deleteAlert);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;
