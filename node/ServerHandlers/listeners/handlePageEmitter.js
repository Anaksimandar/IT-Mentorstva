const emitter = require("../events/emiter");
const logFile = require("../helpers/logFile");

emitter.on("static:error", () => {
	logFile("error", "File failed to load: ");
});

emitter.on("static:success", () => {
	logFile("success", "File loaded successfully: ");
});
