
const test = require("node:test");
const assert = require("node:assert/strict");

const app = require("../src/app");

test("GET /health returns a healthy status", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("unknown routes return 404 JSON", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(
      `http://127.0.0.1:${port}/not-a-real-route`
    );
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error, "API route not found");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("meter search rejects a page number below 1", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/meters?page=0`
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Page must be a positive integer");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

test("meter search rejects an excessively long query", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const query = "a".repeat(101);
    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/meters?q=${query}`
    );
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(
      body.error,
      "Search query must be 100 characters or fewer"
    );
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
});

const { sendPortalError } = require("../src/utils/portalError");

test("portal authentication errors return a safe 502 response", () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  sendPortalError(
    res,
    { status: 401, code: "PORTAL_HTTP_ERROR" },
    "Meter search"
  );

  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /session may have expired/i);
});

test("portal timeouts return 504", () => {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  sendPortalError(
    res,
    { code: "PORTAL_TIMEOUT" },
    "Energy lookup"
  );

  assert.equal(res.statusCode, 504);
  assert.match(res.body.error, /timed out/i);
});
    