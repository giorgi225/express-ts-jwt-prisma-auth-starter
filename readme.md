# 🚀 Express.js Authentication Starter

![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub stars](https://img.shields.io/github/stars/giorgi225/express-ts-prisma-auth-starter?style=social)
![GitHub issues](https://img.shields.io/github/issues/giorgi225/express-ts-prisma-auth-starter)
![GitHub last commit](https://img.shields.io/github/last-commit/giorgi225/express-ts-prisma-auth-starter)

A **secure**, **scalable**, and **production-ready** authentication system built with **Express.js**, **JWT**, **TypeScript**, and **Prisma**. Perfect for startups and developers looking to add authentication to their projects.

---

## ✨ Features

- **Secure JWT-based authentication**: Access and refresh tokens for secure user sessions.
- **CSRF protecion** protection: Prevent Cross-Site Request Forgery (CSRF) attacks using the csrf-csrf library.
- **Refresh token support**: Automatically refresh access tokens without requiring re-login.
- **Input validation with Zod**: Ensure data integrity with robust validation.
- **Scalable folder structure**: Modular and maintainable codebase.
- **TypeScript support**: Type-safe code for better developer experience.
- **Prisma ORM**: Type-safe database interactions with MySQL/PostgreSQL support.
- **HTTP-only cookies**: Secure token storage to prevent XSS attacks.
- **Consistent API responses**: Standardized response format for easy integration.
- **Email verification** _(Optional)_: Send verification emails during user registration (available in the `features/email-verification` branch).

---

## 🛠️ Installation

1. **Clone the repository**:

```bash
   git clone https://github.com/giorgi225/express-ts-prisma-auth-starter.git
```

2. **Install dependencies**:

```bash
 cd express-ts-prisma-auth-starter
 npm install
```

3. **Set up your .env file:**:
   create .env file in root directory of your project and update values:

```bash
# Application Settings
APP_HOST=localhost
APP_PORT=8000

# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/database-name"  # db connection url

# Authentication Settings
AUTH_SECRET="your_jwt_access_token_secret"  # Secret key for signing JWT access tokens
AUTH_SECRET_EXPIRES_IN="15m"                # Access token expiration time (15 minutes)
AUTH_REFRESH_SECRET="your_jwt_refresh_token_secret"  # Secret key for signing JWT refresh tokens
AUTH_REFRESH_SECRET_EXPIRES_IN="24h"        # Refresh token expiration time (24 hours)

# CSRF Protection Settings
CSRF_SECRET="your_csrf_secrert"
```

4. **Run Prisma migrations**:

```bash
npx prisma migrate dev --name init
```

5. **Run Prisma generate**:

```bash
npx prisma generate
```

6. **Run the project:**:

```bash
npm run dev
```

## 🔑 Authentication Endpoints

| Method | Endpoint                  | Description         | Auth Required |
| ------ | ------------------------- | ------------------- | ------------- |
| POST   | `/api/auth/register`      | Register a new user | ❌ No         |
| POST   | `/api/auth/login`         | Login & get tokens  | ❌ No         |
| POST   | `/api/auth/refresh-token` | Refresh JWT token   | ❌ No         |
| POST   | `/api/auth/logout`        | Logout user         | ✅ Yes        |
| POST   | `/api/auth/get-csrf`      | Get csrf token      | ❌ No         |

## 👤 User Endpoint

| Method | Endpoint         | Description      | Auth Required |
| ------ | ---------------- | ---------------- | ------------- |
| GET    | `/api/user/info` | Get user profile | ✅ Yes        |

# Features

## 🛡️ CSRF Protection

The application includes CSRF protection to prevent Cross-Site Request Forgery (CSRF) attacks. Here’s how it works:

**CSRF Token Generation:**
-- The backend generates a unique CSRF token when the /api/auth/get-csrf endpoint is called.
-- The CSRF token is also sent in the response body for the frontend to include in request headers as **x-csrf-token**.

**CSRF Token Validation:**
-- For every state-changing request (e.g., POST, PUT, DELETE), the frontend includes the CSRF token in the **x-csrf-token** header.
-- The backend validates the CSRF token in the request headers against the one stored in the session.

**Secure Cookies:**
-- The CSRF token is stored in an HTTP-only cookie, preventing client-side JavaScript from accessing it.

## 📩 Email Verification

This feature allows the application to send an email verification link during user registration. To use this feature, make sure to merge the features/email-verification branch into your main branch.

**How It Works:** 1. Registration: When a user registers, the system sends a verification email containing a link with a 6 digit code. 2. Verify Email: user sends 6 digit code to the /api/auth/verify-email endpoint. 3. Successful Verification: The user’s email address is marked as verified in the database, and they can proceed to use the application.

### Email Verification Endpoints:

| Method | Endpoint                            | Description  | Auth Required |
| ------ | ----------------------------------- | ------------ | ------------- |
| POST   | `/api/auth/verify-email`            | Verify email | ❌ No         |
| POST   | `/api/auth/send-email-verification` | Verify email | ❌ No         |

### \*_How to use_:

1. **Merge the Email Verification Feature**:
   First, ensure you're on the `main` branch and merge the `features/email-verification` branch into it.
   ```bash
   git checkout main
   git pull origin main
   git merge features/email-verification
   ```
2. **Update environment variables**:
   # Email Settings
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_SECURE="false"
   EMAIL_USER="user"
   EMAIL_PASS="pass"
   EMAIL_VERIFICATION_EXPIRATION="5m"
