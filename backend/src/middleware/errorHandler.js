export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message =
    status === 500 ? "Internal Server Error" : err.message || "Error";
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
}
