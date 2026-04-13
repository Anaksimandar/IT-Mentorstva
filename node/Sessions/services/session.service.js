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

const getSession = (req) => {
	const cookie = req.headers.cookie || "";
	console.log(cookie);

	// sid=abc123; we want to extract abc123
	const match = cookie.match(/sid=([^;]+)/);
	console.log(match);

	if (!match) return null;

	return sessions[match[1]] || null;
};

module.exports = {
	createSession,
	getSession,
	loadSessions,
	saveSessions,
	isUserLoggedIn,
};
