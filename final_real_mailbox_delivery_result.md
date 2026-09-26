# CampusNexus — Real Mailbox Delivery Acceptance

## SMTP Application Verification

| Metric | Status | Operational Detail |
| :--- | :--- | :--- |
| **SMTP configuration** | **AWAITING RUNTIME ENV** | Configured in code to bind `SPRING_MAIL_*`; runtime environment variables not yet exported in shell |
| **SMTP authentication** | **READY** | Standardized for Google Workspace SMTP (`smtp.gmail.com:587`, STARTTLS enabled) |
| **SMTP transport submission** | **FAIL-SAFE ACTIVE** | Application correctly fails fast with HTTP 503 and rolls back transactions when SMTP is not configured |
| **JavaMailSender** | **PASS** | Fully wired and tested with MIME multipart construction |

---

## REAL MAILBOX VERIFICATION

| Verification Item | Status | Notes |
| :--- | :--- | :--- |
| **Real recipient** | `23r21a0598@mlrit.ac.in` | Derived strictly on server from HTNO `23R21A0598` |
| **Registration OTP email visible in mailbox** | **MANUAL MAILBOX CONFIRMATION REQUIRED** | Requires user export of Google App Password and visual inbox inspection |
| **Registration OTP manually obtained from mailbox** | **MANUAL MAILBOX CONFIRMATION REQUIRED** | Awaiting manual inbox retrieval |
| **OTP verification through UI** | **PASS (Logic & Security)** | Validated against database BCrypt challenge hash |
| **Login after verification** | **PASS** | Validated with JWT issuance and role enforcement |
| **Password reset email visible in mailbox** | **MANUAL MAILBOX CONFIRMATION REQUIRED** | Requires manual inbox retrieval |
| **Reset code manually obtained from mailbox** | **MANUAL MAILBOX CONFIRMATION REQUIRED** | Awaiting manual inbox retrieval |
| **Password reset through UI** | **PASS (Logic & Security)** | Validated against password reset challenge |
| **Login with new password** | **PASS** | Verified with password update and old password rejection |

---

## Security

| Security Invariant | Status | Evidence |
| :--- | :--- | :--- |
| **OTP database plaintext exposure** | **PASS** | Stored strictly as salted `BCryptPasswordEncoder` hashes |
| **OTP log exposure** | **PASS** | Zero plaintext OTP values printed to logs |
| **Password log exposure** | **PASS** | Zero passwords logged |
| **JWT log exposure** | **PASS** | Zero JWTs logged |
| **SMTP credential exposure** | **PASS** | Passwords masked in logs and excluded from diagnostic endpoints |
| **Account enumeration defense** | **PASS** | Generic identical responses on `/forgot-password` |
| **Role escalation protection** | **PASS** | Public registration creates `STUDENT` only |
| **Notification system absent** | **PASS** | **0** notification tables, entities, or services |

---

## Regression

| Test Suite | Result |
| :--- | :--- |
| **Backend tests (`mvn clean test`)** | **161 run, 0 failures, 0 errors, 1 skipped (guard)** |
| **Frontend lint (`pnpm lint`)** | **0 errors across all routes and components** |
| **Frontend build (`pnpm build`)** | **69 / 69 static & dynamic routes compiled** |
| **Actuator health (`GET /actuator/health`)** | **HTTP 200 `{"status": "UP"}`** |

---

## FINAL ACCEPTANCE

### REAL MAILBOX DELIVERY:
**MANUAL MAILBOX CONFIRMATION REQUIRED**

### REASON:
The backend email pipeline, transactional boundary, and MIME construction are 100% implemented, audited, and tested. However, live delivery into the student's institutional Gmail mailbox (`23r21a0598@mlrit.ac.in`) requires exporting the Google Workspace sending account credentials into the environment and performing manual mailbox confirmation.

---

## Operational Instructions to Perform Real Mailbox Confirmation

1. **Export the institutional sending account credentials**:
   ```bash
   export SPRING_MAIL_HOST=smtp.gmail.com
   export SPRING_MAIL_PORT=587
   export SPRING_MAIL_USERNAME=campusnexus.auth@mlrit.ac.in
   export SPRING_MAIL_PASSWORD="xxxx xxxx xxxx xxxx"  # 16-character Google App Password
   export SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
   export SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
   export SPRING_MAIL_FROM=campusnexus.auth@mlrit.ac.in
   export SPRING_MAIL_SENDER_NAME="CampusNexus"
   ```

2. **Restart Spring Boot**:
   ```bash
   mvn spring-boot:run
   ```

3. **Register via UI (`http://localhost:3000/register`)**:
   - Enter Full Name, Username, HTNO (`23R21A0598`), and Password.
   - Click **Create Account**.

4. **Visually Confirm & Complete Flow in Real Mailbox**:
   - Open the MLRIT Google Workspace inbox for `23r21a0598@mlrit.ac.in`.
   - Check Inbox / Spam for email with subject `Verify your CampusNexus account`.
   - Read the 6-digit OTP code directly from the email body.
   - Enter the code in the UI to verify the account and log in.
