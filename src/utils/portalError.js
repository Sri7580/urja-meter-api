
function sendPortalError(res, error, operation) {
  console.error(`${operation} failed:`, error.code || "UNKNOWN_ERROR");

  if (error.status === 401 || error.status === 403) {
    return res.status(502).json({
      error: "The Urja portal rejected the request. The session may have expired.",
    });
  }

  if (error.code === "PORTAL_TIMEOUT") {
    return res.status(504).json({
      error: "The Urja portal request timed out",
    });
  }

  return res.status(502).json({
    error: `Unable to retrieve data from the Urja portal (${operation})`,
  });
}

module.exports = { sendPortalError };
