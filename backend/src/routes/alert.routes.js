const express = require("express");

const { getActiveAlerts } = require("../controllers/alert.controller");

const router = express.Router();

router.get("/", getActiveAlerts);

module.exports = router;
