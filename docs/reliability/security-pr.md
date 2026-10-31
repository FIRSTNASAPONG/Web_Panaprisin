# Security PR — OAuth state, credential preservation and explicit Bearer authentication

Branch: `feature/security-oauth-hardening`; stacked base: `feature/commerce-integrity-hardening`. Review this diff separately from reliability/UX. Do not merge or deploy automatically.

## Confirmed root causes

- SocialAuthController used stateless Socialite on both redirect/callback; no session-bound OAuth state validation.
- updateOrCreate(email) always replaced the existing password with a random hash and could replace a previously linked Google ID.
- Callback exposed long-lived bearer token and user data in query strings; frontend trusted query user fields as fallback when `/user` failed. Password login's Axios error logging could include request credentials in the console.
- Global CSRF exclusion `*` coexisted with stateful Sanctum API middleware despite login returning Bearer tokens. Cookie-authenticated API access was therefore unnecessarily enabled.
- Password login had no rate limiter; Admin was routed to Seller Centre, whose role guard rejects Admin.

## Changes

Same `/api/auth/google/*` URLs now use web middleware + Socialite session state. Callback requires provider-verified email, refuses conflicting existing Google links, preserves passwords/profile/role, and creates only buyer accounts. Tokens are delivered in fragments, never query strings; frontend immediately uses replaceState, validates `/user`, and never accepts URL-supplied role/user. Existing localStorage Bearer scheme remains (24h Sanctum expiration unchanged). Removed credential-bearing console logging.

API is explicitly Bearer-only (`sanctum.guard=[]`, no statefulApi); web routes retain default CSRF protection. Login rate limit is keyed to email+IP, avoiding one global ten-attempt bucket for all users behind the same reverse proxy. No secrets or production settings changed.

## Evidence

AuthSecurityTest: 8 tests / 51 assertions passed locally on SQLite. Earlier 6-test version also passed PostgreSQL as part of 24 tests / 310 assertions; final suite evidence is recorded in validation.md after final execution. Tests verify existing password unchanged, role/profile preserved, new buyer, unverified email and conflicting link rejected, real Socialite state mismatch rejected before network, expired bearer 401, cookie session alone 401, logout revocation, rate limit isolation, and real CSRF middleware 419.

Provider-success tests use a mocked Google identity only inside automated tests. There is no mocked authentication endpoint or demo data in the running application. Google consent screen/real credentials have NOT been tested.

## Risks / rollout prerequisites

This is intentionally a higher-risk separate PR: deploy frontend+backend together. Old query-token callbacks are rejected; an OAuth flow in progress during rollout should restart login. OAuth needs a persistent shared session store and a cookie that survives Google's top-level GET redirect (normally SameSite=Lax, Secure on HTTPS). Confirm existing FRONTEND_URL/GOOGLE_REDIRECT_URI and ingress proxy behavior without exposing secrets. config cache now uses services.google.frontend_url rather than direct env() during callback. Do not change secrets as part of review.

Residual: localStorage bearer tokens remain accessible to same-origin JavaScript; fragment transport is not an HttpOnly-cookie or one-time-code migration. Verified-email account linking is retained for compatibility; an explicit authenticated account-link flow would be a separate policy change. No arbitrary Google data is used to assign roles. Token fragments are scrubbed once JS executes; browser extensions/history before hydration remain outside this fix. No claim of real Google E2E success or production security certification.

## Proposed PR description

Google login currently resets existing local passwords, omits OAuth state validation, and redirects bearer credentials in query strings. This change preserves local credentials, validates session-bound state and verified provider identity, removes query-token trust, and makes API auth explicitly Bearer-only while restoring web CSRF protection. Admin login now reaches Admin Dashboard.

Validation: AuthSecurityTest plus complete backend/frontend/browser results in validation.md. Requires operator testing of real Google login and session-cookie configuration in staging before merge. No deployment, restart or secret change performed.
