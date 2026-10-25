
const BASE_URL =
  process.env.PORTAL_BASE_URL ||
  "https://urja-ops.flockenergy.tech";

async function getJson(path, params = {}) {
  const url = new URL(path, BASE_URL);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const headers = {
    Accept: "application/json",
  };

  // Send the authenticated portal session when configured.
  if (process.env.PORTAL_SESSION_COOKIE) {
    headers.Cookie =
      `__Secure-better-auth.session_token=${process.env.PORTAL_SESSION_COOKIE}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const error = new Error(
      `Urja portal returned HTTP ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("Urja portal returned a non-JSON response");
  }

  return response.json();
}

module.exports = { getJson };
