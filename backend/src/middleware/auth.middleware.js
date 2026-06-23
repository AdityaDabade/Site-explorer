const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { failure } = require("../utils/response");

async function hydrateUserFromToken(req, res, next, required) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    if (required) {
      return failure(res, 401, "Authentication required.");
    }

    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.demo_admin && decoded.role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@tourvision.com";

      req.user = {
        ...decoded,
        _id: "demo-admin",
        id: "demo-admin",
        email: adminEmail,
        name: "TourVision Admin",
        role: "admin",
        active: true,
        demo_admin: true
      };
      req.account = null;
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.active) {
      return failure(res, 401, "Session is no longer valid.");
    }

    req.user = {
      ...decoded,
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active
    };
    req.account = user;
    return next();
  } catch (error) {
    return failure(res, 401, "Invalid or expired token.");
  }
}

function protect(req, res, next) {
  return hydrateUserFromToken(req, res, next, true);
}

function optionalAuth(req, res, next) {
  return hydrateUserFromToken(req, res, next, false);
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return failure(res, 401, "Authentication required.");
  }

  if (req.user.role !== "admin") {
    return failure(res, 403, "Admin access required.");
  }

  return next();
}

function isAdmin(req, res, next) {
  return adminOnly(req, res, next);
}

module.exports = {
  adminOnly,
  isAdmin,
  optionalAuth,
  protect
};
