class AppError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code; // stable value your React client can switch on
  }
}

class EmailTakenError extends AppError {
  constructor() {
    super("Email already in use", 409, "EMAIL_TAKEN");
  }
}

class InvalidCredentialsError extends AppError {
  constructor() {
    super("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
}

module.exports = { AppError, EmailTakenError, InvalidCredentialsError };
