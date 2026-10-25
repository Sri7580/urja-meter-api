# Reflection

### 1. What assumptions did you make?

I assumed that the existing Urja portal endpoints could be reused to build a REST API without recreating the portal's business logic. I also assumed that the JSON responses observed during testing would remain reasonably consistent. Since some endpoints require authentication, I treated the session cookie as environment-based configuration rather than hardcoding credentials or implementing an unverified authentication flow.

### 2. Which part was the most difficult, and how did you get unstuck?

The most difficult part was understanding how the portal exposes its data and how authentication affects API requests. Some requests returned `401` or `403` errors, while others returned structured JSON after authentication. I worked through this by inspecting browser network requests, comparing response formats, testing individual endpoints, and separating confirmed behavior from details that still needed verification.

### 3. If you had another day, what would you improve?

I would investigate the portal's authentication and session-renewal flow more thoroughly, verify every endpoint against live responses, and make the OpenAPI schemas match the actual response structures exactly. I would also add more integration tests, improve pagination and upstream failure handling where needed, and test the API with expired sessions and unavailable portal endpoints.

### 4. What mistake did you make while solving this?

One mistake was treating some observed endpoint behavior as sufficient evidence of how the portal worked overall. Authentication failures initially made it harder to distinguish an endpoint problem from a session problem. I corrected my approach by testing requests with an authenticated session and documenting unresolved behavior instead of assuming that every detail had been confirmed.

### 5. If you were reviewing your own submission, what would you criticise?

The API has a clear structure, input validation, consistent error handling, and automated tests, but its live integration coverage is still limited compared with its unit-test coverage. Some upstream response schemas and frontend request flows need further verification. I would also want to see stronger integration tests, more complete API contract validation, and a clearer strategy for handling session expiration before considering the implementation production-ready.