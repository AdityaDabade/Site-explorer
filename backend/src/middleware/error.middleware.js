const { failure } = require("../utils/response");

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

function errorHandler(error, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  failure(res, statusCode, error.message || "Something went wrong.", {
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}

module.exports = {
  errorHandler,
  notFound
};
