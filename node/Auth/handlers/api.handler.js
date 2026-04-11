const { registerUser, loginUser } = require("../services/user.service");
const querystring = require("querystring");
const {
	validateEmail,
	validatePassword,
	isPasswordSame,
	isCheckBoxChecked,
	validateName,
} = require("../helper/validator");

const apiHandler = async (req, res) => {
	if (req.url === "/api/register" && req.method === "POST") {
		// Handle registration API endpoint
		let data = "";
		req.on("data", (chunk) => {
			data += chunk;
		});

		req.on("end", async () => {
			const { name, email, password, confirmPassword, terms } =
				querystring.parse(data);
			if (!validateName(name)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "Name must be at least 3 characters long",
					}),
				);
			}
			if (!validateEmail(email)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Invalid email format" }));
			}
			if (!validatePassword(password)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "Password must be at least 3 characters long",
					}),
				);
			}
			if (!isPasswordSame(password, confirmPassword)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Passwords do not match" }));
			}

			if (!isCheckBoxChecked(terms)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "You must accept the terms and conditions",
					}),
				);
			}
			try {
				const userId = await registerUser(name, email, password);
				res.statusCode = 201;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ userId }));
			} catch (error) {
				console.error("Error occurred while registering user:", error);
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: error.message }));
			}
		});
	} else if (req.url === "/api/login" && req.method === "POST") {
		// Handle login API endpoint
		let data = "";
		req.on("data", (chunk) => {
			data += chunk;
		});
		req.on("end", async () => {
			const { email, password } = querystring.parse(data);
			if (!validateEmail(email)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Invalid email format" }));
			}
			if (!validatePassword(password)) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				return res.end(
					JSON.stringify({
						message: "Password must be at least 3 characters long",
					}),
				);
			}
			try {
				const user = await loginUser(email, password);
				if (user) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					return res.end(
						JSON.stringify({
							message: "Login successful",
							email: user.email,
						}),
					);
				} else {
					res.statusCode = 401;
					res.setHeader("Content-Type", "application/json");
					return res.end(
						JSON.stringify({ message: "Invalid email or password" }),
					);
				}
			} catch (error) {
				console.error("Error occurred while logging in:", error);
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify({ message: "Internal Server Error" }));
			}
		});
	} else {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain");
		return res.end("API Endpoint Not Found\n");
	}
};

module.exports = apiHandler;
