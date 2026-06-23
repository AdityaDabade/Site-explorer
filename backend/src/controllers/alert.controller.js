const Alert = require("../models/Alert");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

const getActiveAlerts = asyncHandler(async (req, res) => {
  const now = new Date();
  const alerts = await Alert.find({
    active: true,
    starts_at: { $lte: now },
    $or: [{ ends_at: null }, { ends_at: { $gte: now } }]
  })
    .populate("place", "name place_id")
    .sort({ severity: 1, createdAt: -1 });

  return success(res, {
    alerts: alerts.map((alert) => ({
      ...alert.toJSON(),
      place_name: alert.place?.name || "All places",
      place_id: alert.place?.place_id || ""
    }))
  });
});

module.exports = {
  getActiveAlerts
};
