const { body } = require("express-validator");

const createJobValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("User must be a valid ID"),

  body("companyId")
    .notEmpty()
    .withMessage("Company is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Company must be a valid ID"),

  body("technologies")
    .notEmpty()
    .withMessage("At least one technology is required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("Technologies must be a non-empty array"),

  body("technologies.*").isInt({ min: 1 }).withMessage("Each technology must be a valid ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .bail()
    .isLength({ min: 3, max: 30 })
    .withMessage("Title must be between 3 and 30 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .bail()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("salary")
    .notEmpty()
    .withMessage("Salary is required")
    .bail()
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number"),

  body("due_date")
    .notEmpty()
    .withMessage("Due date is required")
    .bail()
    .isISO8601()
    .withMessage("Due date must be a valid date (YYYY-MM-DD)")
    .toDate()
    .custom((value) => {
      if (value < new Date()) {
        throw new Error("Due date must be in the future");
      }
      return true;
    }),
];

module.exports = { createJobValidation };
