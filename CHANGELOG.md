# Changelog

All notable changes to this project will be documented in this file.

---

## [1.0.0] - 2025-03-23
### Added
- **JWT-based authentication**:
  - Secure user authentication using JSON Web Tokens (JWT).
  - Access tokens with a short expiration time (15 minutes).
  - Refresh tokens with a longer expiration time (24 hours) for seamless session management.
- **Token management**:
  - HTTP-only cookies for secure token storage.
  - Token revocation on logout.
  - Refresh token rotation for enhanced security.
- **CSRF protection:**
	- Implemented Double Submit Cookie pattern using csrf-csrf.
	- CSRF tokens stored in secure, HTTP-only cookies.
	- CSRF validation for all non-GET requests.
	- GET /api/auth/get-csrf: Fetch CSRF token securely via an HTTP-only cookie.
- **Input validation**:
  - Robust validation of user input using Zod.
  - Validation schemas for login, registration, and other endpoints.
- **Prisma ORM integration**:
  - Type-safe database interactions with MySQL/PostgreSQL.
  - User model with fields for authentication and token management.
- **Scalable project structure**:
  - Modular folder structure with controllers, middlewares, routes, and utilities.
  - TypeScript support for type safety and better developer experience.
- **API endpoints**:
  - User registration (`POST /api/auth/register`).
  - User login (`POST /api/auth/login`).
  - Token refresh (`POST /api/auth/refresh-token`).
  - User logout (`POST /api/auth/logout`).
  - Fetch csrf token (`GET /api/auth/get-csrf`)
  - Fetch user info (`GET /api/user/info`).
- **Security best practices**:
  - Password hashing using bcrypt.
  - Protection against XSS and CSRF attacks.
  - Environment variables for sensitive data.
- **Consistent API responses**:
  - Standardized response format using a custom `Send` utility.
- **Documentation**:
  - Comprehensive README with installation instructions, API reference, and usage examples.

---

## [Unreleased]
### Planned Features
- **OAuth2 integration**: Support for Google, GitHub, and other OAuth providers.
- **Email verification**: Send verification emails during user registration.
- **Rate limiting**: Protect against brute-force attacks.
- **Role-based access control (RBAC)**: Restrict access to routes based on user roles.