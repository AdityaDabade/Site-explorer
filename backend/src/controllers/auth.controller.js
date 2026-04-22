const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { failure, success } = require("../utils/response");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return failure(res, 400, "Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return failure(res, 409, "An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password
  });

  return success(
    res,
    {
      token: signToken(user),
      user: user.toJSON()
    },
    201
  );
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return failure(res, 400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return failure(res, 401, "Invalid email or password.");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    return failure(res, 401, "Invalid email or password.");
  }

  if (!user.active) {
    return failure(res, 403, "This account has been deactivated.");
  }

  return success(res, {
    token: signToken(user),
    user: user.toJSON()
  });
}

async function getMe(req, res) {
  return success(res, {
    user: req.account ? req.account.toJSON() : req.user
  });
}

async function logout(req, res) {
  return success(res, {
    message: "Logged out successfully."
  });
}

module.exports = {
  getMe,
  login,
  logout,
  signup
};
