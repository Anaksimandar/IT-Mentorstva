const validateEmail = (email) => {
	const emailRegex = /^.{3,}@.*$/;
	return emailRegex.test(email);
};

const validatePassword = (password) => {
	return password.length >= 3;
};

const validateName = (name) => {
	return name.length >= 3;
};

const isPasswordSame = (password, confirmPassword) => {
	return password === confirmPassword;
};

const isCheckBoxChecked = (checkbox) => {
	return checkbox === "on";
};

module.exports = {
	validateEmail,
	validatePassword,
	isPasswordSame,
	isCheckBoxChecked,
	validateName,
};
