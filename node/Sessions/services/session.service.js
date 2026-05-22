const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const SESSION_FILE = path.join(__dirname, "../sessions/sessions.json");

const loadSessions = () => {
	try {
		const data = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
		// Ensure we always return an object, not an array
		return typeof data === "object" && !Array.isArray(data) ? data : {};
	} catch (err) {
		console.error("Error loading sessions:", err);
		return {};
	}
};

const sessions = loadSessions();

const createSession = (userId) => {
	// Use Object.entries to get both sessionId (key) and session object (value)
	const sessionEntry = Object.entries(sessions).find(
		([sessionId, session]) => session.userId === userId,
	);

	if (sessionEntry) {
		const [sessionId] = sessionEntry;
		return sessionId;
	}
	const sessionId = crypto.randomUUID();
	sessions[sessionId] = {
		userId: userId,
		createdAt: Date.now(),
		shoppingCart: [],
	};
	saveSessions(sessions);
	return sessionId;
};

const saveSessions = (sessions) => {
	try {
		console.log("Saving sessions to:", SESSION_FILE);
		console.log("Sessions to save:", sessions);
		fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), "utf-8");
		console.log("Sessions saved successfully");
	} catch (err) {
		console.error("Error saving sessions:", err);
		console.error("File path:", SESSION_FILE);
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

const addToShoppingCart = (userId, productId) => {
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
	console.log(sessions);

	const cookie = req.headers.cookie || "";
	// sid=abc123; we want to extract abc123
	const match = cookie.match(/sid=([^;]+)/);

	if (!match) return null;

	const session = sessions[match[1]];
	if (!session) return null;

	return session;
};

module.exports = {
	createSession,
	getSession,
	loadSessions,
	saveSessions,
	isUserLoggedIn,
	logout,
	addToShoppingCart,
};
