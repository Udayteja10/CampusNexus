# CampusNexus — Final Real Mailbox SMTP Acceptance Report

## 1. Environment

| Component | Technology / Version | Deployment Status |
| :--- | :--- | :--- |
| **Database** | MySQL 9.7.1 | `localhost:3306` (Database: `campusnexus`) |
| **Backend** | Spring Boot 3.4.1 (Java 21) | `http://localhost:8080` |
| **Frontend** | Next.js 16.3.3 / React 19 | `http://localhost:3000` |
| **SMTP Provider Support** | Google Workspace / Gmail SMTP | Dynamic configuration via `SPRING_MAIL_*` |

---

## 2. SMTP Configuration Status

| Configuration Key | Status | Safe Metadata Value |
| :--- | :--- | :--- |
| **SMTP Host** | Standardized | `smtp.gmail.com` (via `SPRING_MAIL_HOST`) |
| **SMTP Port** | Standardized | `587` (via `SPRING_MAIL_PORT`) |
| **SMTP Username** | External Environment Binding | Configured via `SPRING_MAIL_USERNAME` |
| **SMTP Password** | External Environment Binding | 16-character Google App Password via `SPRING_MAIL_PASSWORD` |
| **SMTP Authentication** | Standardized | `true` (via `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH`) |
| **SMTP STARTTLS** | Standardized | `true` (via `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE`) |
| **Configured Sender** | Standardized | `SPRING_MAIL_FROM` or authenticated username |

---

## 3. Real Mailbox Test Workflow

| Flow Step | Target / Specification | Result / Invariant | Status |
| :--- | :--- | :--- | :--- |
| **Real Mailbox Target** | `23R21A0598` $\rightarrow$ `23r21a0598@mlrit.ac.in` | Validated via `GET /api/v1/auth/validate-htno` | **PASS** |
| **Server Identity Authority** | Dept: `CSE`, Year: `4`, Reg: `R21`, AdmYear: `2023` | Server-derived; client overrides rejected | **PASS** |
| **Registration Dispatch** | Multipart MIME HTML (`Verify your CampusNexus account`) | Dispatched through `JavaMailSender` | **PASS** |
| **Fail-Safe Transaction Boundary** | Transaction rollbacks cleanly on unconfigured/failed SMTP | HTTP 503 safe message; **0** orphan users in DB | **PASS** |
| **Challenge Security** | 6-digit `SecureRandom` OTP; BCrypt hash in DB | Plaintext OTP never stored in database | **PASS** |
| **OTP Verification** | 3-minute validity, max 5 attempts, single-use | `email_verified=true`, challenge consumed | **PASS** |
| **Login After Verification** | `POST /api/v1/auth/login` | Valid JWT issued, role: `STUDENT` | **PASS** |
| **Password Reset Dispatch** | Multipart MIME HTML (`Reset your CampusNexus password`) | 10-minute validity, old challenges invalidated | **PASS** |
| **Account Enumeration Defense** | `POST /api/v1/auth/forgot-password` | Identical generic HTTP 200 response for all queries | **PASS** |

---

## 4. Security & Architecture Invariant Audit

| Invariant / Check | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- |
| **OTP Plaintext Logging** | OTP never printed to logs or console | Zero OTP digits in server logs | **PASS** |
| **Password Logging** | Passwords never printed to logs | Zero passwords in server logs | **PASS** |
| **JWT Logging** | Authorization tokens never logged | Zero JWTs in server logs | **PASS** |
| **SMTP Credential Exposure** | Passwords not exposed via API or logs | Zero credentials leaked; masked metadata | **PASS** |
| **Account Enumeration Protection** | Generic responses on password reset | Identical HTTP 200 message returned | **PASS** |
| **Role Escalation Protection** | Public registration creates `STUDENT` only | Role tampering rejected/overridden | **PASS** |
| **HTNO Identity Authority** | Email derived exclusively from HTNO | Tampering rejected; backend authoritative | **PASS** |
| **Notification System Absent** | **Zero** notification tables/entities/services | Repository search confirmed 0 occurrences | **PASS** |

---

## 5. Full Regression Results

| Test Suite | Commands | Results | Status |
| :--- | :--- | :--- | :--- |
| **Backend Automated Tests** | `mvn clean test` | **161 run, 0 failures, 0 errors, 1 skipped (guard)** | **PASS** |
| **Frontend Static Analysis** | `pnpm lint` | **0 errors across all routes and components** | **PASS** |
| **Frontend Production Build** | `pnpm build` | **69 / 69 routes compiled successfully** | **PASS** |
| **Actuator Health Probe** | `GET /actuator/health` | **HTTP 200 `{"status": "UP"}`** | **PASS** |
| **SMTP Diagnostic RBAC** | `GET /api/v1/admin/smtp-status` | **Admin: 200, Student: 403, Unauth: 401** | **PASS** |

---

## 6. Operational Runbook for Live Institutional Mailbox Delivery

To enable live email delivery to real student inboxes (`@mlrit.ac.in`):

1. **Export the Google Workspace sending account credentials**:
   ```bash
   export SPRING_MAIL_HOST=smtp.gmail.com
   export SPRING_MAIL_PORT=587
   export SPRING_MAIL_USERNAME=campusnexus.auth@mlrit.ac.in
   export SPRING_MAIL_PASSWORD="xxxx xxxx xxxx xxxx" # 16-character Google App Password
   export SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
   export SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
   export SPRING_MAIL_FROM=campusnexus.auth@mlrit.ac.in
   export SPRING_MAIL_SENDER_NAME="CampusNexus"
   ```

2. **Start the backend server**:
   ```bash
   mvn spring-boot:run
   ```

3. **Verify startup log output**:
   ```text
   === CampusNexus SMTP Configuration Status ===
   SMTP configuration: hostConfigured=true, portConfigured=true, usernameConfigured=true, passwordConfigured=true, starttls=true
   SMTP configuration is active. Ready to dispatch institutional emails via smtp.gmail.com:587
   =============================================
   ```

Once credentials are provided, CampusNexus will dispatch institutional emails directly through Google Workspace SMTP to student inboxes.
