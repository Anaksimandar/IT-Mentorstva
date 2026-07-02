const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../data/sessions.json");
console.log(FILE_PATH);
const createSession = (userId) => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const session = { userId, createdAt: Date.now() };
  sessions[sessionId] = session;
  saveSessions(sessions);
  return sessionId;
};

const isUserLoggedIn = (sessionId) => {
  const session = sessions[sessionId];
  if (!session) {
    return false; // No session found for the given sessionId
  }
  const sessionAge = Date.now() - session.createdAt;
  const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (sessionAge > maxSessionAge) {
    delete sessions[sessionId]; // Session expired, remove it
    saveSessions(sessions);
    return false; // Session has expired
  }
  return true; // Session is valid
};

const loadSessions = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8", null, 2);
    const loadedSessions = JSON.parse(data);
    return loadedSessions;
  } catch (error) {
    console.error("Error loading sessions:", error);
    return {};
  }
};

const saveSessions = (sessions) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(sessions), "utf-8");
  } catch (error) {
    console.error("Error saving sessions:", error);
  }
};

const getSession = (req) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null; // No cookies found in the request
  }
  const sessionId = cookieHeader.split("sessionId=")[1];
  return sessions[sessionId];
};

const sessions = loadSessions();

module.exports = { createSession, loadSessions, sessions, isUserLoggedIn, getSession };
