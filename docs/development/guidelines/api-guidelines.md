# API Guidelines

## Purpose

This document defines API design and development standards for the So Quoteable project.

## RESTful Design Principles

### Resource Naming

- Use nouns, not verbs
- Use plural names for collections
- Use lowercase with hyphens
- Be consistent

```
✓ Good:
  GET /quotes
  GET /quotes/123
  POST /quotes
  PUT /quotes/123
  DELETE /quotes/123

✗ Bad:
  GET /getQuotes
  POST /createQuote
  GET /quote/123 (inconsistent plural/singular)
```

### HTTP Methods

- **GET**: Retrieve resources (safe, idempotent)
- **POST**: Create new resources
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update
- **DELETE**: Remove resource (idempotent)

### Status Codes

Use appropriate HTTP status codes:

**Success:**
- 200 OK: Successful GET, PUT, PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE

**Client Errors:**
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Resource conflict
- 422 Unprocessable Entity: Validation errors

**Server Errors:**
- 500 Internal Server Error: General server error
- 503 Service Unavailable: Temporary unavailability

## Request/Response Format

### Request Body

```json
{
  "quote": {
    "text": "The quote text",
    "author": "Author Name",
    "source": "Source Title",
    "image_url": "https://example.com/image.jpg"
  }
}
```

### Response Format

Success response:
```json
{
  "data": {
    "id": "123",
    "quote": "...",
    "author": "...",
    "created_at": "2025-10-22T12:00:00Z"
  }
}
```

Error response:
```json
{
  "error": {
    "code": "INVALID_QUOTE",
    "message": "Quote text is required",
    "details": {
      "field": "quote.text",
      "reason": "required"
    }
  }
}
```

## Versioning

- Include version in URL: `/api/v1/quotes`
- Maintain backward compatibility when possible
- Clearly document breaking changes
- Deprecate old versions gradually

## Authentication

- Use JWT tokens or OAuth 2.0
- Include authentication in headers: `Authorization: Bearer <token>`
- Implement rate limiting
- Validate all inputs

## Pagination

For list endpoints:

```
GET /quotes?page=2&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

## Filtering and Sorting

```
GET /quotes?author=einstein&sort=-created_at
```

- Use query parameters for filtering
- Use `-` prefix for descending sort
- Document available filters

## Error Handling

- Return consistent error format
- Include helpful error messages
- Don't expose sensitive information
- Log errors server-side

## Documentation

- Document all endpoints
- Include request/response examples
- Document authentication requirements
- Keep documentation up to date
- Consider using OpenAPI/Swagger

## Performance

- Implement caching where appropriate
- Use compression (gzip)
- Minimize payload size
- Implement field selection (`?fields=id,title`)

## Security

- Validate all inputs
- Sanitize outputs
- Use HTTPS only
- Implement CORS properly
- Rate limit to prevent abuse
- Never trust client input

---

*Update this document as your API evolves.*
