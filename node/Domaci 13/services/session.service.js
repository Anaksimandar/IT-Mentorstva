const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../data/sessions.json");

const createSession = (userId) => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const session = { userId, createdAt: Date.now() };
  sessions[sessionId] = session;
  saveSessions(sessions);
  return sessionId;
};

const addToCart = (sessionId, itemId) => {
  const session = sessions[sessionId];
  console.log(session);

  if (!session) {
    return false;
  }
  if (!Array.isArray(session.shoppingCart)) {
    session.shoppingCart = [];
  }
  session.shoppingCart.push(itemId);
  saveSessions(sessions);
  return true;
};

const logoutSession = (sessionId) => {
  delete sessions[sessionId];
  saveSessions(sessions);
  return "sessionId=; Path=/; Max-Age=0";
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

const getSessionId = (req) => {
  const cookieHeader = req?.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/(?:^|;\s*)sessionId=([^;]+)/);
  return match ? match[1] : null;
};

const getSession = (req) => {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return null;
  }

  const session = sessions[sessionId];
  console.log(session);

  if (!session) {
    return null;
  }

  return { ...session, sessionId, shoppingCart: session.shoppingCart || [] };
};

const getCartItemsIds = (req) => {
  const session = getSession(req);
  console.log(session);

  if (!session) return [];

  return session.shoppingCart || [];
};

const sessions = loadSessions();

module.exports = {
  createSession,
  loadSessions,
  sessions,
  isUserLoggedIn,
  getSession,
  getSessionId,
  logoutSession,
  addToCart,
  getCartItemsIds,
};
