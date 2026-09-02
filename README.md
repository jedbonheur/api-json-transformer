# JSON Dog-to-Cat Transformer

Hi — thanks again for the great conversation. I enjoyed learning more about the role and the team.

This repository contains my solution to the technical exercise. I kept the core requirement small, while adding a few things I would expect in a real service: organized application layers, validated configuration, request-size protection, consistent JSON errors, graceful shutdown, and meaningful tests.

## Run the project

Node.js 20 or newer is required.

```bash
npm ci
npm test
npm run typecheck
npm run build
npm start
```

The server starts at:

```text
http://localhost:3000
```

For development with automatic restarts:

```bash
npm run dev
```

## API

### Transform JSON

```http
POST /replace
Content-Type: application/json
```

Example:

```bash
curl -i -X POST http://localhost:3000/replace \
  -H "Content-Type: application/json" \
  -d '{"pet":"dog","animals":["dog","bird","dog"],"note":"dog park"}'
```

Response:

```json
{
  "pet": "cat",
  "animals": ["cat", "bird", "cat"],
  "note": "dog park"
}
```

The response header contains the number of changes:

```text
X-Replacements-Made: 3
```

The transformed JSON is returned directly, so objects, arrays, and primitive JSON values keep their original shape.

### Health check

```http
GET /health
```

```json
{
  "status": "ok"
}
```

## Configuration

| Variable           |   Default | Purpose                          |
| ------------------ | --------: | -------------------------------- |
| `MAX_REPLACEMENTS` |     `100` | Maximum replacements per request |
| `MAX_BODY_BYTES`   | `1000000` | Maximum accepted JSON body size  |
| `PORT`             |    `3000` | Server port                      |

Example:

```bash
MAX_REPLACEMENTS=2 PORT=8080 npm start
```

Invalid configuration is rejected during startup.

## Assumptions

- Only values exactly equal to the case-sensitive string `"dog"` are replaced.
- Object keys are not changed.
- Values such as `"Dog"`, `"dogs"`, and `"dog park"` are unchanged.
- The replacement maximum applies independently to every request.
- Once the maximum is reached, later matches remain `"dog"`.
- Traversal is depth-first and left-to-right.
- Any valid JSON root is accepted, including arrays, strings, numbers, booleans, and `null`.
- An empty body is different from the valid JSON value `null`.

## A quick tour of the code

If you would like the shortest path through the implementation, I suggest this order:

### 1. Replacement logic

```text
src/services/replaceDogValues.ts
```

This contains the main behavior. It uses an explicit work stack instead of recursive calls, allowing it to handle deeply nested JSON without overflowing JavaScript’s call stack.

The parsed request body is updated in place. Because the body belongs only to the current request, this avoids allocating a second full copy.

### 2. Unit tests

```text
test/replaceDogValues.test.ts
```

These tests document exact matching, replacement limits, primitive roots, invalid limits, traversal order, and deeply nested input.

### 3. Configuration

```text
src/config.ts
src/helpers/readWholeNumber.ts
test/config.test.ts
```

Environment variables are parsed and validated once during startup.

### 4. HTTP request flow

```text
src/middleware/jsonBody.ts
src/routes/replace.ts
src/app.ts
```

The request passes through content-type validation and size-limited JSON parsing before reaching the replacement service. `app.ts` only connects the pieces, keeping it easy to scan.

### 5. HTTP integration tests

```text
test/app.test.ts
```

These tests use Supertest to cover successful requests, primitive JSON, malformed and empty bodies, content types, request-size limits, concurrent requests, health checks, and error responses.

## Design and trade-offs

The service is stateless, and replacement counters are local to each request. This allows multiple instances to run behind a load balancer without coordinating shared state.

JSON parsing and transformation run synchronously on Node’s event loop. The configurable body-size limit keeps that work bounded. If much larger payloads were required, I would benchmark streaming JSON processing or worker threads before adding that complexity.

The replacement count is returned in a header instead of wrapping the caller’s arbitrary JSON in a response envelope.

## Quality checks

```bash
npm test
npm run typecheck
npm run format:check
npm run build
```

## With more time

For a production deployment, I would add:

- Structured logging and request IDs
- Metrics and request timeouts
- Load testing with representative payloads
- Container and CI configuration
- OpenAPI documentation
- Automated dependency and security scanning

I added more structure and edge-case handling than the smallest possible solution, but each addition addresses a specific concern that could appear in a real API. I avoided adding abstractions or infrastructure the exercise did not need.

Thanks again for taking the time to review it.
