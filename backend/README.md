# CampusNexus Backend

CampusNexus — An Integrated Academic and Campus Community Platform.

This is the Spring Boot backend application responsible for core business logic, validation, database infrastructure, persistence, authentication, operational monitoring, and REST APIs.

---

## Important Phase Notes

> **Backend Phase 3 — Authentication + JWT + Spring Security**
>
> - **Security Stack**: Stateless authentication with **Spring Security 6**, **BCrypt** password hashing, and **JJWT 0.12.6**.
> - **Top-Level Role Model**: Exactly 3 top-level login roles: `STUDENT`, `MODERATOR`, and `ADMIN`.
> - **Registration Policy**: Public registration (`POST /api/v1/auth/register`) strictly registers as `STUDENT` without accepting role parameters from the client.
> - **JWT Tokens**: Signed using HMAC-SHA (256-bit+ key from `JWT_SECRET`). Expiration is configurable via `JWT_EXPIRATION_MS`.
> - **Database**: Flyway migration `V2__create_users.sql` manages the `users` table; Hibernate validates under `ddl-auto=validate`.
> - **Strict Phase 3 Boundary**:
>   - Domain modules (Community, Academic, Career, Campus Life, Admin moderation) are **deferred to later phases**.
>   - Department permissions & club leader capabilities remain student-level permissions to be added in later domain phases.
>   - All development dependencies are free/open-source.

---

## Architecture

The CampusNexus platform follows a decoupled client-server architecture:
- **Frontend**: Next.js application located in `frontend/` (presentation layer).
- **Backend**: Spring Boot application located in `backend/` (business logic, validation, security, persistence, API layer).
- **Security**: Stateless Spring Security filter chain verifying Bearer JWT tokens.
- **Persistence**: Spring Data JPA + Hibernate ORM (with schema validation) on top of Spring JDBC & HikariCP.
- **Database**: MySQL 9.7.1 schema managed via Flyway.

```
Next.js (Frontend)
       ↓  HTTP / REST (Authorization: Bearer <JWT>)
Spring Boot Security (JwtAuthenticationFilter)
       ↓  SecurityContextHolder (ROLE_STUDENT, ROLE_MODERATOR, ROLE_ADMIN)
Spring Boot Controllers & Services
       ↓  Spring Data JPA / Hibernate ORM (ddl-auto=validate)
       ↓  Spring JDBC / HikariCP
MySQL 9.7.1 (`campusnexus` DB)
       ↑  Flyway Migrations (`src/main/resources/db/migration`)
```

---

## Technology Stack

- **Java Version**: 21 (LTS)
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6, JJWT 0.12.6, BCrypt Password Encoder
- **Build Tool**: Maven 3.9+
- **Database**: MySQL Community Server (MySQL 9.7.1)
- **Key Dependencies**:
  - `spring-boot-starter-web`: RESTful web services using Spring MVC
  - `spring-boot-starter-security`: Spring Security core & web security
  - `jjwt-api`, `jjwt-impl`, `jjwt-jackson`: JSON Web Token generation & validation
  - `spring-boot-starter-data-jpa`: Spring Data JPA & Hibernate ORM 6.5
  - `spring-boot-starter-jdbc`: Spring JDBC & HikariCP connection pool
  - `mysql-connector-j`: Official MySQL JDBC Driver
  - `flyway-core` & `flyway-mysql`: Database schema migration management
  - `spring-boot-starter-validation`: Jakarta Bean Validation infrastructure
  - `spring-boot-starter-actuator`: Health checks & operational monitoring
  - `spring-boot-starter-test` & `spring-security-test`: Testing suite with JUnit 5, MockMvc, AssertJ

---

## Project Structure

```
backend/
├── pom.xml
├── .gitignore
├── .env.example
├── README.md
└── src/
    ├── main/
    │   ├── java/com/campusnexus/
    │   │   ├── CampusNexusApplication.java
    │   │   ├── config/
    │   │   │   ├── CorsConfig.java
    │   │   │   └── SecurityConfig.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   └── HealthController.java
    │   │   ├── dto/
    │   │   │   ├── ApiResponse.java
    │   │   │   ├── AuthResponse.java
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── RegisterRequest.java
    │   │   │   └── UserDto.java
    │   │   ├── entity/
    │   │   │   ├── Role.java
    │   │   │   ├── SystemMetadata.java
    │   │   │   └── User.java
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   ├── repository/
    │   │   │   ├── SystemMetadataRepository.java
    │   │   │   └── UserRepository.java
    │   │   ├── security/
    │   │   │   ├── CustomAccessDeniedHandler.java
    │   │   │   ├── CustomAuthenticationEntryPoint.java
    │   │   │   ├── CustomUserDetailsService.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   └── JwtService.java
    │   │   └── service/
    │   │       ├── AuthService.java
    │   │       ├── DatabasePingService.java
    │   │       ├── HealthService.java
    │   │       └── SystemMetadataService.java
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-prod.yml
    │       └── db/
    │           └── migration/
    │               ├── V1__initial_schema.sql
    │               └── V2__create_users.sql
    └── test/
        └── java/com/campusnexus/
            ├── ActuatorHealthTest.java
            ├── CampusNexusApplicationTests.java
            ├── DatabaseConnectivityTest.java
            ├── controller/
            │   ├── AuthIntegrationTest.java
            │   └── HealthControllerTest.java
            ├── exception/
            │   └── GlobalExceptionHandlerTest.java
            ├── repository/
            │   └── SystemMetadataRepositoryTest.java
            └── security/
                ├── JwtServiceTest.java
                └── RoleAuthorizationTest.java
```

---

## Database Configuration & Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DB_HOST` | MySQL Server Hostname | `localhost` |
| `DB_PORT` | MySQL Server Port | `3306` |
| `DB_NAME` | MySQL Database Name | `campusnexus` |
| `DB_USERNAME` | MySQL Username | `root` |
| `DB_PASSWORD` | MySQL Password | *(Set locally)* |
| `JWT_SECRET` | 256-bit+ Signing Key for JWT | *(Set locally)* |
| `JWT_EXPIRATION_MS` | JWT Access Token Lifetime | `86400000` (24h) |
| `SERVER_PORT` | Application Port | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring Profile | `dev` |
| `CORS_ALLOWED_ORIGINS` | CORS Origin URL | `http://localhost:3000` |

### Environment Setup
Copy `.env.example` to your local environment file or export environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=campusnexus
export DB_USERNAME=root
export DB_PASSWORD=<MYSQL_PASSWORD>
export JWT_SECRET=<YOUR_256_BIT_SECRET>
export JWT_EXPIRATION_MS=86400000
```

---

## Authentication Endpoints

### 1. Register
- **URL**: `POST /api/v1/auth/register` (Public)
- **Request**:
  ```json
  {
    "email": "student@campusnexus.com",
    "password": "Password@123"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "<JWT_TOKEN>",
      "tokenType": "Bearer",
      "expiresIn": 86400000,
      "user": {
        "id": 1,
        "email": "student@campusnexus.com",
        "role": "STUDENT"
      }
    }
  }
  ```

### 2. Login
- **URL**: `POST /api/v1/auth/login` (Public)
- **Request**:
  ```json
  {
    "email": "student@campusnexus.com",
    "password": "Password@123"
  }
  ```
- **Response**: `200 OK` with `AuthResponse`.

### 3. Current User Profile
- **URL**: `GET /api/v1/auth/me` (Protected — Requires `Authorization: Bearer <token>`)
- **Response**: `200 OK` with `UserDto`.

---

## How to Build and Run

### 1. Build and Run Tests
```bash
cd backend
DB_USERNAME=root DB_PASSWORD=<MYSQL_PASSWORD> JWT_SECRET=<JWT_SECRET> mvn clean test
```

### 2. Run Locally
```bash
cd backend
DB_USERNAME=root DB_PASSWORD=<MYSQL_PASSWORD> JWT_SECRET=<JWT_SECRET> mvn spring-boot:run
```

---

## Backend Roadmap

- [x] **Backend Phase 1 — Spring Boot Foundation**
- [x] **Backend Phase 2A — MySQL Database Infrastructure**
- [x] **Backend Phase 2B — JPA + Hibernate + Persistence**
- [x] **Backend Phase 3 — Authentication + JWT + Spring Security** (Current)
- [ ] **Backend Phase 4** — Users + Departments + Authorization
- [ ] **Backend Phase 5** — Community
- [ ] **Backend Phase 6** — Academic
- [ ] **Backend Phase 7** — Career
- [ ] **Backend Phase 8** — Campus Life
- [ ] **Backend Phase 9** — Help & Support
- [ ] **Backend Phase 10** — Admin / Moderation
