const Expense = require("../models/Expense");
const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/response");

function normalizeExpensePayload(body) {
  if (Array.isArray(body.items) && body.items.length) {
    return body.items;
  }

  return [body];
}

function buildSplit(amount, members) {
  const sanitizedMembers = Array.isArray(members) && members.length ? members : ["You"];
  const perPerson = Number((Number(amount) / sanitizedMembers.length).toFixed(2));

  return {
    per_person: perPerson,
    breakdown: sanitizedMembers.map((person) => ({
      person,
      amount: perPerson
    }))
  };
}

const addExpenses = asyncHandler(async (req, res) => {
  const items = normalizeExpensePayload(req.body);
  const sharedMembers = req.body.members || req.body.participants || [];

  const expenseDocs = await Expense.insertMany(
    items.map((item) => ({
      trip: item.trip_id || req.body.trip_id || null,
      user: req.user?._id || null,
      title: item.title || item.name || "Expense",
      category: item.category || "transport",
      payer: item.payer || "You",
      amount: Number(item.amount || 0),
      participants: item.participants || sharedMembers,
      split: buildSplit(item.amount || 0, item.participants || sharedMembers),
      incurred_on: item.date || item.incurred_on || Date.now(),
      notes: item.notes || ""
    }))
  );

  const total = expenseDocs.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return success(
    res,
    {
      expenses: expenseDocs.map((expense) => expense.toJSON()),
      total,
      per_person:
        expenseDocs.length && expenseDocs[0].split?.breakdown?.length
          ? Number(
              (
                total /
                Math.max(expenseDocs[0].split.breakdown.length, 1)
              ).toFixed(2)
            )
          : total
    },
    201
  );
});

const listExpenses = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.tripId) {
    query.trip = req.query.tripId;
  }

  const expenses = await Expense.find(query).sort({ incurred_on: -1 });

  return success(res, {
    expenses: expenses.map((expense) => expense.toJSON()),
    total: expenses.length
  });
});

module.exports = {
  addExpenses,
  listExpenses
};
