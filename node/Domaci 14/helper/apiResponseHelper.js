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

module.exports = {
  successResponse,
  successCreatedResponse,
};
