# Urja Portal Protocol Notes

## 1. Overview

The Urja Meter API is a read-only REST API wrapper around the Urja Operations Portal. It exposes selected portal functionality through a separate, documented API built with Node.js and Express.

**Portal base URL:** `https://urja-ops.flockenergy.tech`

The wrapper uses Node.js's native Fetch API to send HTTP requests, process JSON responses, and return results through its own API endpoints.

The purpose of this investigation was to understand the portal's HTTP endpoints, request parameters, response structures, authentication behavior, and limitations before building the wrapper.

## 2. Observed Portal Endpoints

| Portal endpoint | Method | Purpose |
|---|---|---|
| `/portal/meters/search?q=&page=1` | GET | Search meters with pagination |
| `/portal/dts?page=1` | GET | Retrieve distribution transformers |
| `/portal/meters/:meterId/energy` | GET | Retrieve meter energy readings |
| `/portal/meters/:meterId/geo` | GET | Retrieve meter geographic coordinates |
| `/portal/export?page=1` | GET | Retrieve a larger dataset containing hierarchy-related fields |
| `/portal/keys` | Not confirmed here | Observed during investigation of portal configuration and request signing |

The endpoints above were identified during inspection of portal requests and responses. Their successful accessibility may depend on authentication and additional request headers.

The HTTP method for `/portal/keys` should be confirmed against the actual browser network request before documenting it as definitive.

## 3. Meter Search

### Request

```http
GET /portal/meters/search?q=J100010&page=1
Accept: application/json
```

### Query parameters

| Parameter | Purpose |
|---|---|
| `q` | Search query used to filter meter records |
| `page` | Page number for pagination |

### Observed response structure

The response contains the following top-level fields:

| Field | Description |
|---|---|
| `data` | Array of matching meter records |
| `total` | Total number of matching records |
| `page` | Current page number |
| `pageSize` | Number of records per page |

Observed meter fields include:

- `meterId`
- `serialNo`
- `make`
- `phaseType`
- `installStatus`
- `dtCode`

### Example response

An observed search for `J100010` returned the following response:

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

This confirms that the portal supports meter search and returns paginated JSON data.

The listed fields represent observed fields, not necessarily the complete meter schema.

## 4. Distribution Transformer Listing

### Request

```http
GET /portal/dts?page=1
Accept: application/json
```

### Query parameters

| Parameter | Purpose |
|---|---|
| `page` | Page number for retrieving transformer records |

### Observed fields

The transformer response includes fields such as:

- `code`
- `name`
- `feederCode`
- `capacityKva`

For example, an observed record associated transformer code `DT-001` with the name `Malviya Nagar DT 1`, feeder code `F-001`, and capacity of `100` kVA.

Additional records and pagination behavior should be examined before treating these fields and relationships as exhaustive.

## 5. Energy Readings

### Request

```http
GET /portal/meters/:meterId/energy
Accept: application/json
```

Replace `:meterId` with the identifier of the meter being queried.

### Observed fields

The energy response was observed to include fields such as:

- `timestamp`
- `kwh`
- `kvah`
- `voltR`

The timestamp format observed during investigation was:

`DD/MM/YYYY HH:mm`

**### Authentication status**

Initial requests without the required authorization returned HTTP `401 Unauthorized`. A successful response was subsequently observed through an authorized request.

The observed response contains a `data` array of energy readings. Each reading includes `timestamp`, `kwh`, `kvah`, and `voltR`, with values represented as strings. The timestamp format observed was `DD/MM/YYYY HH:mm`.

The observed response confirms these fields and types for the successful request. It does not establish that every response will always contain the same fields or historical range.

## 6. Meter Geographic Location

### Request

```http
GET /portal/meters/:meterId/geo
Accept: application/json
```

Replace `:meterId` with the target meter identifier.

A successful response was observed through an authorized request. The response contains a `data` object with `latitude` and `longitude` fields, both represented as strings.

An initial programmatic request returned HTTP `401 Unauthorized`, indicating that authorization may be required.

The observed response confirms this structure for the successful request, but it does not guarantee that the portal will always return the same schema.

## 7. Authentication and Session Management

### 7.1 Browser login

The portal login flow was observed to submit a POST request to:

```http
POST /login
```

The request used form-encoded fields named:

- `email`
- `password`

The observed browser request also included the following header:

```http
x-sveltekit-action: true
```

Origin and Referer headers were present as well.

These observations describe the browser request. They do not prove that replaying the same request without the full browser flow will always succeed.

### 7.2 Session cookie

Following browser login, the portal issued a session cookie named:

```text
__Secure-better-auth.session_token
```

The observed cookie had a maximum age of 3600 seconds, equivalent to one hour.

The cookie was marked `HttpOnly`, `Secure`, and `SameSite=Lax`.

An authenticated browser session successfully accessed the meter-search endpoint. Requests without the required session cookie returned HTTP `401` for some endpoints.

### 7.3 Programmatic login findings

An initial programmatic login attempt returned HTTP `403 Forbidden` and did not establish a session cookie.

Therefore, automated login, session renewal, and the exact requirements for reproducing the browser login flow remain unresolved.

The current wrapper can forward a configured session cookie through the `PORTAL_SESSION_COOKIE` environment variable. This is an interim approach rather than a completed automatic authentication solution.

### 7.4 Credential handling

Credentials and session cookies must be treated as secrets.

- Keep credentials in the local `.env` file.
- Exclude `.env` from Git using `.gitignore`.
- Do not place real session cookies, passwords, or signing secrets in documentation.
- Do not log cookie values or authentication headers.
- Do not commit secrets to a public GitHub repository.
- If a session token is exposed, invalidate the session or sign out and authenticate again.

The `.env.example` file should contain variable names and safe placeholders only.

## 8. Export Endpoint and Hierarchy Data

### Request

```http
GET /portal/export?page=1
```

The export endpoint was observed to return a larger dataset containing hierarchy-related fields.

Observed hierarchy levels included:

- Zone
- Circle
- Division
- Subdivision
- Substation
- Feeder
- Distribution transformer

Additional fields such as latitude, longitude, installation type, and build-related information were also observed during the investigation.

The exact schema, field optionality, and pagination behavior should be verified using representative responses.

### Required headers

Requests to the export endpoint were observed to require headers named:

```http
x-signature: ...
x-timestamp: ...
```

The procedure for generating the signature has not been established.

The existence of these headers does not establish the signature algorithm, canonical request format, timestamp units, or signing-key derivation.

Export functionality should not be considered implemented until the required signing procedure has been verified and the request succeeds through the wrapper.

## 9. Additional Investigation: `/portal/keys`

The `/portal/keys` endpoint was observed during the investigation and its response included a field named `signingSecret`.

The purpose of this field and its relationship to the export endpoint's signature headers have not been verified.

The actual secret value is deliberately omitted from this document.

Further investigation should establish the intended and authorized signing procedure without exposing or committing credentials. The endpoint's HTTP method, access requirements, and complete response schema should also be confirmed from the actual network request.

The wrapper must not expose secret values through public API responses, error messages, logs, or documentation.

## 10. Wrapper Architecture and Request Behavior

The wrapper is implemented using Node.js and Express.

Its upstream client is responsible for communicating with the portal, while route handlers expose the wrapper's public API.

### 10.1 Upstream client behavior

The current upstream client:

1. Reads the portal base URL from environment configuration.
2. Constructs request URLs using the configured base URL and endpoint path.
3. Appends query parameters when provided.
4. Sends HTTP GET requests.
5. Includes an `Accept: application/json` header.
6. Adds the portal session cookie when `PORTAL_SESSION_COOKIE` is configured.
7. Applies a 15-second request timeout.
8. Rejects non-successful HTTP responses.
9. Checks the response content type before parsing JSON.
10. Returns the parsed JSON response to the calling route.

These details describe the current implementation and should be updated if the client changes.

### 10.2 Public wrapper endpoints

The wrapper exposes the following routes:

| Method | Wrapper endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check whether the API is running |
| GET | `/api/v1/meters?q=&page=1` | Search meters |
| GET | `/api/v1/transformers?page=1` | List transformers |
| GET | `/api/v1/meters/:meterId/energy` | Retrieve energy readings |
| GET | `/api/v1/meters/:meterId/geo` | Retrieve meter location |

The wrapper currently forwards successful upstream JSON responses instead of converting them into a separate normalized schema.

### 10.3 Input validation

The route handlers validate user-supplied inputs before making upstream requests.

Current validation includes:

- Meter search queries must not exceed 100 characters.
- Page numbers must be positive integers.
- Meter identifiers must contain only permitted alphanumeric characters and hyphens, with a maximum length of 50 characters.

Invalid input results in HTTP `400 Bad Request`.

### 10.4 Error handling

The wrapper returns JSON error responses for invalid inputs, unknown routes, and upstream failures.

| HTTP status | Meaning |
|---|---|
| `200 OK` | The request succeeded |
| `400 Bad Request` | Input validation failed |
| `404 Not Found` | No matching wrapper route |
| `502 Bad Gateway` | The upstream portal returned an unsuccessful HTTP status, an unexpected response, or another upstream request error |
| `504 Gateway Timeout` | The upstream request exceeded its configured timeout |

For upstream HTTP `401` or `403` responses, the wrapper returns a `502` response with a message indicating that the portal may have rejected the session.

The upstream client uses a 15-second timeout. Network failures, invalid JSON, and unexpected content types are handled as upstream errors and normally result in `502`.

The wrapper does not automatically renew expired portal sessions. Error messages are returned without exposing session credentials or raw upstream response bodies.

## 11. Limitations and Unresolved Questions

- **Authentication and session renewal:** The wrapper uses a configured portal session cookie. Automatic login and session renewal are not implemented.
- **Export endpoint signing:** The `/portal/export` endpoint requires `x-signature` and `x-timestamp`. The signing algorithm has not been confirmed or implemented.
- **Signing secret purpose:** The `/portal/keys` endpoint exposes a `signingSecret` field, but its intended use and relationship to export request signing have not been verified. Secret values must not be included in documentation or source code.
- **Transformer response details:** Confirm the exact response structure and field types against a fresh successful `/portal/dts?page=1` response before treating the transformer schema as definitive.
- **Portal stability and data freshness:** The wrapper depends on the upstream portal's availability and response format. Changes to the portal may require corresponding updates to the wrapper.

The energy and geographic response schemas have been observed from successful portal responses. Their observed fields and types are documented in the relevant sections above; they should not be listed as unverified. This does not guarantee that the portal will always return the same schema.
## 12. Testing and Verification Plan

The following checks should be performed before considering the wrapper complete:

- Verify that the health endpoint returns HTTP `200`.
- Verify meter search with a known meter identifier.
- Verify transformer listing and pagination.
- Verify energy readings using an authorized request.
- Verify geographic data using an authorized request.
- Test invalid query parameters and meter identifiers.
- Test unknown wrapper routes.
- Test upstream `401`, `403`, `5xx`, timeout, and invalid JSON behavior.
- Verify that no secrets are present in logs, documentation, or the Git repository.
- Validate `openapi.json` against the actual implemented routes and response schemas.
- Confirm the export signature requirements before implementing export support.

Testing should use authorized, read-only requests and should not attempt to bypass access controls or disrupt the portal.

## 13. Future Improvements

Potential improvements include:

- Implement secure automated authentication and session renewal once the login flow is understood.
- Verify all endpoint response schemas and document representative examples.
- Add consistent response schemas and error codes.
- Add mocked upstream tests and controlled integration tests.
- Add structured logging with sensitive data redaction.
- Add caching with explicit expiration and freshness rules.
- Implement hierarchy queries and local indexing if required by the assignment.
- Add bulk retrieval only where supported and permitted by the portal.
- Expand the OpenAPI specification with verified schemas, examples, and error responses.
- Add monitoring and operational documentation for deployment.

## 14. Summary

The investigation identified the main meter-search and transformer endpoints, the energy and geographic routes, a hierarchy-oriented export endpoint, and the portal's session-based authentication behavior.

Meter search was successfully accessed through an authenticated browser session and through the wrapper when a session cookie was configured. Initial requests to certain endpoints returned authentication errors, but successful responses were subsequently observed for the energy and geographic endpoints through authorized requests.

The primary unresolved technical issues are automated session management, successful verification of all endpoint response schemas, and understanding the export endpoint's signature requirements.

The wrapper provides a foundation for exposing the portal's read-only functionality through a documented REST API. Further work should focus on verifying the remaining protocol details, strengthening tests, and ensuring that the implementation and documentation accurately reflect observed behavior.
