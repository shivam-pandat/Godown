// auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "DEV_SECRET_CHANGE_THIS";

function sign(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: "7d" }
  );
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { sign, verify };
