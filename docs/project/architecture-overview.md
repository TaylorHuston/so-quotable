# Architecture Overview

## Project: So Quoteable

**Last Updated**: 2025-10-22

---

## Executive Summary

So Quoteable is a web application that allows users to generate quotes on top of images of the source of the quote, with verified, attributed sources.

This document provides a high-level overview of the system architecture, key components, and design decisions.

---

## System Context

### Purpose

Enable users to:
- Create visually appealing quote images
- Ensure quotes have verified, attributed sources
- Share quote images on social media and other platforms

### Key Stakeholders

- **End Users**: People who create and share quote images
- **Content Moderators**: (If applicable) Verify quote sources
- **Development Team**: Build and maintain the application

---

## Architecture Principles

See [architectural-principles.md](../development/guidelines/architectural-principles.md) for detailed principles.

Key principles:
1. **Separation of Concerns**: Clear boundaries between layers
2. **Security First**: Validate sources, protect user data
3. **Scalability**: Design for growth in users and quotes
4. **Maintainability**: Clean, testable code

---

## High-Level Architecture

### Architectural Style

[To be determined based on implementation]

Options being considered:
- **Monolithic**: Single deployable application (simpler to start)
- **Microservices**: Separate services for quotes, images, auth (more scalable)
- **Serverless**: Function-based architecture (lower infrastructure overhead)

### Technology Stack

**Current decisions** (update as decided):

- **Frontend**: [To be determined - likely Next.js based on README.md]
- **Backend**: [To be determined - likely Node.js/Express based on README.md]
- **Database**: [To be determined]
- **Image Storage**: [To be determined - S3, Cloudinary, etc.]
- **Deployment**: Vercel (mentioned in README.md)
- **Authentication**: [To be determined]

See [ADRs](./adrs/README.md) for detailed decision records as they are made.

---

## System Components

### 1. Frontend (Presentation Layer)

**Responsibilities**:
- User interface for quote creation
- Image upload and preview
- Quote text input and formatting
- Source attribution input
- Quote rendering on images
- Export/share functionality

**Key Features**:
- Quote editor with live preview
- Image overlay controls (position, size, opacity)
- Typography controls (font, size, color)
- Source verification UI

### 2. Backend (Business Logic Layer)

**Responsibilities**:
- Quote CRUD operations
- Source verification
- Image processing
- User authentication and authorization
- Quote validation
- API endpoints

**Key Services** (potential structure):
- Quote Service: Manage quote data
- Image Service: Handle image upload, processing, storage
- Verification Service: Verify quote sources
- User Service: Manage user accounts

### 3. Database (Data Layer)

**Responsibilities**:
- Persistent storage of quotes
- User account information
- Source verification records
- Quote metadata

**Key Entities**:
- **Quote**: text, author, source, verification status
- **User**: account information, created quotes
- **Image**: image metadata, storage location
- **Source**: source information, verification details

### 4. External Services

**Image Storage**:
- Store uploaded images
- Serve generated quote images
- CDN for performance

**Source Verification** (potential):
- Third-party APIs for quote verification
- Manual verification system
- Crowdsourced verification

**Authentication** (potential):
- OAuth providers (Google, GitHub, etc.)
- Email/password authentication

---

## Data Flow

### Quote Creation Flow

```
User → Frontend → Backend API → Database
                      ↓
                  Image Service → Image Storage
                      ↓
                  Verification Service → Verification DB
```

1. User creates quote in frontend
2. Frontend sends quote data to backend API
3. Backend validates quote data
4. Image is uploaded and processed
5. Quote is stored in database
6. Source verification is initiated
7. Generated quote image is returned to user

### Quote Retrieval Flow

```
User → Frontend → Backend API → Database
                      ↓
                  Image Storage (CDN) → User
```

---

## Security Architecture

See [security-guidelines.md](../development/guidelines/security-guidelines.md) for detailed guidelines.

**Key Security Measures**:

1. **Authentication**: Secure user login and session management
2. **Authorization**: Role-based access control
3. **Input Validation**: All user inputs validated and sanitized
4. **Source Verification**: Ensure quote authenticity
5. **Data Encryption**: HTTPS, encrypted storage of sensitive data
6. **Rate Limiting**: Prevent abuse and DDoS
7. **File Upload Security**: Validate and scan uploaded images

---

## Scalability Considerations

### Horizontal Scaling

- Stateless backend design
- Load balancing across multiple instances
- Database connection pooling

### Caching Strategy

- **Client-side**: Browser caching for static assets
- **CDN**: Image delivery via CDN
- **Application**: Cache frequently accessed quotes
- **Database**: Query result caching

### Performance Optimization

- Image optimization (compression, lazy loading)
- Database indexing on frequently queried fields
- Pagination for large result sets
- Background processing for heavy tasks (image generation)

---

## Deployment Architecture

### Environment Strategy

1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live user-facing application

### CI/CD Pipeline

(To be implemented)

```
Code Push → Tests → Build → Deploy to Staging → Manual Approval → Deploy to Production
```

### Infrastructure

**Hosting**: [Based on README.md, likely Vercel]

**Monitoring**: [To be determined]
- Application performance monitoring
- Error tracking
- User analytics

**Logging**: [To be determined]
- Centralized logging
- Log aggregation and analysis

---

## API Architecture

See [api-guidelines.md](../development/guidelines/api-guidelines.md) for detailed guidelines.

### API Style

RESTful API design

### Key Endpoints (proposed)

```
# Quotes
GET    /api/v1/quotes           # List quotes
POST   /api/v1/quotes           # Create quote
GET    /api/v1/quotes/:id       # Get quote
PUT    /api/v1/quotes/:id       # Update quote
DELETE /api/v1/quotes/:id       # Delete quote

# Images
POST   /api/v1/images           # Upload image
GET    /api/v1/images/:id       # Get image

# Users
POST   /api/v1/users/register   # Register user
POST   /api/v1/users/login      # Login
GET    /api/v1/users/me         # Get current user

# Verification
POST   /api/v1/quotes/:id/verify  # Verify quote source
```

---

## Database Schema (Proposed)

### Quotes Table

```sql
quotes:
  - id (PK)
  - user_id (FK)
  - text
  - author
  - source
  - source_url
  - image_id (FK)
  - verified (boolean)
  - created_at
  - updated_at
```

### Users Table

```sql
users:
  - id (PK)
  - email
  - password_hash
  - name
  - created_at
  - updated_at
```

### Images Table

```sql
images:
  - id (PK)
  - user_id (FK)
  - filename
  - storage_url
  - width
  - height
  - created_at
```

---

## Error Handling Strategy

See [api-guidelines.md](../development/guidelines/api-guidelines.md#error-handling) for details.

- Consistent error response format
- Appropriate HTTP status codes
- User-friendly error messages
- Detailed server-side logging
- Graceful degradation

---

## Testing Strategy

See [testing-standards.md](../development/guidelines/testing-standards.md) for detailed standards.

### Testing Pyramid

- **Unit Tests**: Individual functions, components
- **Integration Tests**: API endpoints, database interactions
- **E2E Tests**: Critical user flows (create quote, share quote)

---

## Future Considerations

### Phase 2 Features (Potential)

- Social features (like, comment, share)
- Collections and galleries
- Advanced image editing
- Batch quote generation
- API for third-party integrations
- Mobile apps

### Technical Improvements

- Microservices architecture (if scale demands)
- Real-time collaboration
- Advanced caching strategies
- Machine learning for source verification
- Internationalization (i18n)

---

## Architecture Decision Records

For detailed records of architectural decisions, see [ADRs](./adrs/README.md).

Key decisions to document:
- Database selection
- Frontend framework choice
- Authentication strategy
- Image storage solution
- Deployment platform

---

## Diagrams

### System Context Diagram

[To be added]

### Component Diagram

[To be added]

### Data Flow Diagram

[To be added]

### Deployment Diagram

[To be added]

---

## References

- [Project Brief](../project-brief.md)
- [API Guidelines](../development/guidelines/api-guidelines.md)
- [Security Guidelines](../development/guidelines/security-guidelines.md)
- [Testing Standards](../development/guidelines/testing-standards.md)
- [ADRs](./adrs/README.md)

---

**Note**: This is a living document. Update as architectural decisions are made and the system evolves.

**Next Steps**:
1. Make key technology decisions (document in ADRs)
2. Create detailed component designs
3. Design database schema
4. Define API contracts
5. Create architecture diagrams
