const { readRequestBody } = require("./readRequestBody");
const readJsonBody = async (req) => {
  const raw = await readRequestBody(req);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error("Invalid JSON body");
    err.statusCode = 400;
    throw err;
  }
};

module.exports = {
  readJsonBody,
};
