function success(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

function failure(res, statusCode, message, extra = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...extra
  });
}

module.exports = {
  failure,
  success
};
