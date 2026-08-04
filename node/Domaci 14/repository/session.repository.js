const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../data/sessions.json");

const normalizeCartItems = (cartItems = []) => {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  return cartItems.reduce((acc, item) => {
    if (!item) {
      return acc;
    }

    if (typeof item === "object" && item !== null && "itemId" in item) {
      acc.push({
        itemId: String(item.itemId),
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      });
      return acc;
    }

    const existingItem = acc.find((entry) => String(entry.itemId) === String(item));
    if (existingItem) {
      existingItem.quantity += 1;
      return acc;
    }

    acc.push({ itemId: String(item), quantity: 1 });
    return acc;
  }, []);
};

const insertSession = (userId) => {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const session = { userId, createdAt: Date.now(), shoppingCart: [] };
  sessions[sessionId] = session;
  saveSessions(sessions);
  return sessionId;
};

const insertItemToCart = (sessionId, itemId) => {
  const session = sessions[sessionId];

  if (!session) {
    return false;
  }

  const normalizedCart = normalizeCartItems(session.shoppingCart);
  const existingItem = normalizedCart.find((entry) => String(entry.itemId) === String(itemId));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    normalizedCart.push({ itemId: String(itemId), quantity: 1 });
  }
  session.shoppingCart = normalizedCart;
  saveSessions(sessions);
  return true;
};

const deleteItemFromCart = (sessionId, itemId) => {
  const session = sessions[sessionId];

  if (!session) {
    return false;
  }

  const normalizedCart = normalizeCartItems(session.shoppingCart);
  const existingItem = normalizedCart.find((entry) => String(entry.itemId) === String(itemId));

  if (existingItem) {
    existingItem.quantity -= 1;
    if (existingItem.quantity <= 0) {
      normalizedCart.splice(normalizedCart.indexOf(existingItem), 1);
    }
  }

  session.shoppingCart = normalizedCart;
  saveSessions(sessions);
  return true;
};

const deleteCart = (sessionId) => {
  const session = sessions[sessionId];

  if (!session) {
    return false;
  }

  session.shoppingCart = [];
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

const findSessionId = (req) => {
  const cookieHeader = req?.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(/(?:^|;\s*)sessionId=([^;]+)/);
  return match ? match[1] : null;
};

const findSession = (req) => {
  const sessionId = findSessionId(req);
  if (!sessionId) {
    return null;
  }

  const session = sessions[sessionId];
  if (!session) {
    return null;
  }

  const normalizedCart = normalizeCartItems(session.shoppingCart);
  if (
    !Array.isArray(session.shoppingCart) ||
    session.shoppingCart.some((item) => typeof item === "string")
  ) {
    session.shoppingCart = normalizedCart;
    saveSessions(sessions);
  }

  return { ...session, sessionId, shoppingCart: normalizedCart };
};

const findCartItemsIds = (req) => {
  const session = findSession(req);

  if (!session) return [];

  return session.shoppingCart || [];
};

const sessions = loadSessions();

module.exports = {
  insertSession,
  loadSessions,
  sessions,
  isUserLoggedIn,
  findSession,
  findSessionId,
  logoutSession,
  insertItemToCart,
  deleteCart,
  findCartItemsIds,
  deleteItemFromCart,
};
