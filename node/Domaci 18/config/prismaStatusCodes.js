const PrismaErrorCodes = Object.freeze({
  UNIQUE_CONSTRAINT_FAILED: "P2002",
  RECORD_NOT_FOUND: "P2025",
  FOREIGN_KEY_FAILED: "P2003",
  REQUIRED_RELATION_VIOLATION: "P2014",
});

module.exports = { PrismaErrorCodes };
