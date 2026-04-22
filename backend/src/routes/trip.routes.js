const express = require("express");

const {
  addTripExpense,
  getTripById,
  getTripExpenses,
  getTripExpenseSplit,
  getTrips,
  planTrip,
  uploadTravelStory
} = require("../controllers/trip.controller");
const { optionalAuth } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", optionalAuth, getTrips);
router.post("/plan", optionalAuth, planTrip);
router.get("/:id", optionalAuth, getTripById);
router.post("/:id/expenses", optionalAuth, addTripExpense);
router.get("/:id/expenses", optionalAuth, getTripExpenses);
router.get("/:id/expenses/split", optionalAuth, getTripExpenseSplit);
router.post(
  "/stories",
  optionalAuth,
  upload.fields([
    { name: "story", maxCount: 10 },
    { name: "stories", maxCount: 10 },
    { name: "files", maxCount: 10 }
  ]),
  uploadTravelStory
);

module.exports = router;
