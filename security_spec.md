# Security Specification — AEC Hardware Club Weekly Quiz

## 1. Data Invariants
1. Answer keys (`correctAnswer`) in the `/questions` collection must NEVER be directly readable by participants. Only admins can read `/questions`. Participant questions are delivered via secure server-side API stripped of correct answers.
2. Participant scores in `/submissions` must NOT be readable by participants to preserve competition secrecy. Only admins can read `/submissions`.
3. Participant profile in `/users/{userId}` contains PII (email, phone number) and can only be read by the user themselves (`request.auth.uid == userId`) or an admin.
4. Quizzes (`/quizzes`) and published winners (`/winners`) are publicly readable so participants can inspect quiz status and leaderboard.
5. All administrative mutations (creating questions, publishing winners, updating quiz state) require verified admin authorization (`isSuperAdmin()` or `isAdmin()`).

## 2. The Dirty Dozen Payloads
1. **Direct Answer Key Scrape**: An unauthenticated or standard participant queries `GET /questions/{id}` to view `correctAnswer`. (Denied by `allow read: if isAdmin()`).
2. **Participant Score Peeking**: Standard participant queries `GET /submissions/{id}` to see calculated marks. (Denied by `allow read: if isAdmin()`).
3. **Ghost Role Self-Promotion**: User attempts to write `{ role: "admin" }` to their own `/users/{uid}` document or create `/admins/{uid}`. (Denied by rules).
4. **PII Snooping**: User A attempts to `GET /users/{userB_id}` to retrieve User B's phone number and email. (Denied by `isOwner(userId) || isAdmin()`).
5. **Unauthenticated Quiz Mutation**: Anonymous user attempts to update `/quizzes/{quizId}` state from `PAUSED` to `LIVE`. (Denied).
6. **False Winner Injection**: Standard participant writes to `/winners/{quizId}` claiming 1st place. (Denied by `allow write: if isAdmin()`).
7. **Spoofed Email Claim**: Attacker with unverified email tries to claim admin status. (Denied by `request.auth.token.email_verified == true`).
8. **Attempt Tampering**: User A attempts to read or update User B's attempt record in `/attempts/{attemptId}`. (Denied by `isOwner(resource.data.uid)`).
9. **Question Bank Sabotage**: Participant sends `DELETE /questions/{id}`. (Denied by `allow write: if isAdmin()`).
10. **Oversized Field Payload Attack**: Injected 2MB string into user profile. (Denied by length validations).
11. **Direct Submission Forgery**: Participant writes fabricated score to `/submissions/{id}` without server evaluation. (Denied by `allow write: if isAdmin()`).
12. **Blanket User Directory Scraping**: Participant lists all user accounts. (Denied by `allow list: if isAdmin()` on `/users`).
