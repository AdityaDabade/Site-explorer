const express = require("express");

const { addExpenses, listExpenses } = require("../controllers/expense.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", optionalAuth, listExpenses);
router.post("/", optionalAuth, addExpenses);

module.exports = router;
