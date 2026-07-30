const successResponse = (res, data) => {
  data.success = true;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const successCreatedResponse = (res, data) => {
  data.success = true;
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const unauthorizedResponse = (res, message = "Unauthorized") => {
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message }));
};

const dbErrorResponse = (res, message = "Database error") => {
  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message }));
};

module.exports = {
  successResponse,
  successCreatedResponse,
  unauthorizedResponse,
  dbErrorResponse,
};
