const crypto = require("crypto");
const fs = require("fs");

const SESSION_FILE = "./sessions/sessions.json";

const createSession = (userId) => {
	const sessionId = crypto.randomUUID();
	sessions[sessionId] = { userId: userId, createdAt: Date.now() };
	saveSessions(sessions);
	return sessionId;
};

const loadSessions = () => {
	try {
		const data = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
		return data;
	} catch (err) {
		console.error("Error loading sessions:", err);
		return {};
	}
};

const sessions = loadSessions();

const saveSessions = (sessions) => {
	try {
		fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), "utf-8");
	} catch (err) {
		console.error("Error saving sessions:", err);
		return null;
	}
};

const isUserLoggedIn = (req) => {
	const session = getSession(req);
	return session !== null;
};

const logout = (userId) => {
	for (const sessionId in sessions) {
		if (sessions[sessionId].userId === userId) {
			delete sessions[sessionId];
			saveSessions(sessions);
			break;
		}
	}
	return;
};

const addToShoppingChart = (userId, productId) => {
	const session = Object.values(sessions).find((s) => s.userId === userId);
	if (!session) {
		throw new Error("Session doesnt exists");
	}
	if (!Array.isArray(session.shoppingCart)) {
		session.shoppingCart = [];
	}
	if (session.shoppingCart.some((item) => item.productId === productId)) {
		session.shoppingCart = session.shoppingCart.map((item) => {
			if (item.productId === productId) {
				return { ...item, quantity: item.quantity + 1 };
			}
			return item;
		});
		saveSessions(sessions);
		return;
	}
	const cartObject = { productId: productId, quantity: 1 };
	session.shoppingCart.push(cartObject);
	saveSessions(sessions);
	return;
};
const getSession = (req) => {
	const cookie = req.headers.cookie || "";
	// sid=abc123; we want to extract abc123
	const match = cookie.match(/sid=([^;]+)/);

	if (!match) return {};

	return sessions[match[1]] || {};
};

module.exports = {
	createSession,
	getSession,
	loadSessions,
	saveSessions,
	isUserLoggedIn,
	logout,
	addToShoppingChart,
};
