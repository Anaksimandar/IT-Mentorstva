const path = require("path");
const fs = require("fs");

function logFile(fileName, message) {
	const pathToLogs = path.join(__dirname, "../logs", fileName + ".log");
	const formatedMessage = `[${new Date().toISOString()}] ${message}\n`;
	fs.appendFile(pathToLogs, formatedMessage, (err) => {
		if (err) {
			console.error("Error writing logs:", err);
		}
	});
}

module.exports = logFile;
