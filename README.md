# Urja Meter API

A Node.js and Express REST API wrapper for the Urja Operations Portal. It exposes meter search, distribution transformer listing, meter energy readings, and meter geographic location through a documented, read-only REST interface.

## Features

- Meter search with pagination
- Distribution transformer listing
- Meter energy reading lookup
- Meter geographic location lookup
- Input validation and consistent JSON error responses
- OpenAPI specification
- Environment-based configuration
- Automated tests using Node.js's built-in test runner

## Tech Stack

- Node.js
- Express.js
- Native Fetch API
- dotenv
- Node.js built-in test runner

## Prerequisites

- Node.js 20 or later
- npm
- Authorized access to the Urja portal for endpoints that require authentication

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Sri7580/urja-meter-api.git
cd urja-meter-api-node
npm install
```

Create a local environment file.

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux**

```bash
cp .env.example .env
```

Configure the environment variables in `.env`:

```env
PORT=3000
PORTAL_BASE_URL=https://urja-ops.flockenergy.tech
PORTAL_SESSION_COOKIE=
```

`PORTAL_SESSION_COOKIE` is a sensitive session credential. Configure it only when you have authorized access to the portal. Never commit real session credentials to version control.

## Run the API

Development mode:

```bash
npm run dev
```

Start the API:

```bash
npm start
```

The API runs at `http://localhost:3000` by default.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API health |
| GET | `/api/v1/meters?q=J100010&page=1` | Search meters |
| GET | `/api/v1/transformers?page=1` | List distribution transformers |
| GET | `/api/v1/meters/:meterId/energy` | Retrieve energy readings |
| GET | `/api/v1/meters/:meterId/geo` | Retrieve meter coordinates |

### Search meters

Request:

```http
GET /api/v1/meters?q=J100010&page=1
```

Example response based on an observed portal response:

```json
{
  "data": [
    {
      "meterId": "J100010",
      "serialNo": "GE98722",
      "make": "Secure",
      "phaseType": "single",
      "installStatus": "Faulty",
      "dtCode": "DT-011"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

The `q` parameter is optional and limited to 100 characters. The `page` parameter must be a positive integer.

### List transformers

Request:

```http
GET /api/v1/transformers?page=1
```

The response contains transformer data returned by the portal. The `page` parameter must be a positive integer.

### Retrieve energy readings

Request:

```http
GET /api/v1/meters/J100000/energy
```

Returns the portal's energy-reading data for the specified meter.

### Retrieve meter coordinates

Request:

```http
GET /api/v1/meters/J100000/geo
```

Returns the portal's geographic-location data for the specified meter.

## Error Handling

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid input |
| `404 Not Found` | Unknown API route |
| `502 Bad Gateway` | Upstream portal request failed or returned an unexpected response |
| `504 Gateway Timeout` | The upstream portal request timed out |

For upstream authentication failures (`401` or `403`), the wrapper returns a safe error message indicating that the portal session may have expired.

## Authentication and Configuration

The wrapper sends the configured `PORTAL_SESSION_COOKIE` to the upstream portal when the variable is present. Some portal endpoints may require an authenticated session.

The wrapper does not currently implement automated login or session renewal. An expired or rejected session may therefore require the cookie to be refreshed through an authorized process.

See [PROTOCOL.md](./PROTOCOL.md) for observed upstream behavior and known limitations.

## Tests

Run the automated test suite:

```bash
npm test
```

The current suite covers API health, unknown routes, meter-search input validation, upstream authentication-error handling, and timeout handling.

## API Specification

The OpenAPI specification is available in [`openapi.json`](./openapi.json).

## Security

- Keep session credentials in `.env`.
- Never commit `.env` or real session cookies.
- Use `.env.example` to document configuration without exposing credentials.
- Keep access read-only and authorized.
- Do not expose upstream secrets or internal error details in API responses.

## Limitations and Future Improvements

- Implement automated login and session renewal if supported by the portal.
- Verify authentication requirements for all upstream endpoints.
- Add integration tests using mocked upstream responses.
- Add tests for invalid JSON, network failures, and upstream HTTP errors.
- Consider structured logging, response normalization, and caching where appropriate.
- Expand hierarchy and bulk-data support after validating the portal protocol.

## Engineering Notes

The wrapper currently forwards the upstream JSON responses rather than transforming them into a new domain model. This keeps the implementation small and reduces assumptions about the legacy portal's response structure.

## Reflection

See [REFLECTION.md](./REFLECTION.md) for my reflections on assumptions,
challenges, mistakes, and potential improvements.