const path = require("path");
const fs = require("fs");

function logFile(fileName, message) {
	const logsDir = path.join(__dirname, "../logs");
	const pathToLogs = path.join(logsDir, fileName + ".log");
	const formatedMessage = `[${new Date().toISOString()}] ${message}\n`;

	fs.mkdir(logsDir, { recursive: true }, (err) => {
		if (err) {
			console.error("Error checking logs directory:", err);
			return;
		}
		fs.appendFile(pathToLogs, formatedMessage, (err) => {
			if (err) {
				console.error("Error writing logs:", err);
			}
		});
	});
}

module.exports = logFile;
