# Phase 1 — Azure deployment failure / safe patch proposal

Evidence: [run 41189371948](https://github.com/FIRSTNASAPONG/Web_Panaprisin/actions/runs/41189371948), job 124502783091, 2026-10-31 09:36–09:41 UTC, SHA `05d91653bde01198b7df9543bb51139dabfc37d0`.

CI, frontend/backend publishing, release `deploy-2026-10-31-01`, SSH, image pulls and container recreation succeeded. Health probes repeatedly emitted `curl: (2) no URL specified` for Products API/Frontend, then `ERROR: Deployment health check failed`. Final output said automatic retries of this SHA were blocked. Logs also showed HTTP 200 application requests; this is NOT proof of a fully healthy deployment, but the failing curl invocation never measured service availability.

Confirmed root cause category: malformed health-check invocation (curl exit 2), not HTTP 000 from an unhealthy endpoint. Exact faulty source line remains unknown: neither scripts/deploy.sh nor scripts/auto-deploy.sh is tracked at this SHA. Do not claim a GitHub commit fixes Azure's local scripts. Do not rerun Actions, SSH `deploy`, clear failed-SHA state, or restart services to inspect this incident.

## Repository changes

- `scripts/check-health.sh`: standalone read-only helper, explicit quoted --url, bounded retries/timeouts, exact HTTP 200, no redirect/TLS bypass, nonzero on failure.
- `tests/health-check-test.py`: real curl + local HTTP server (missing URL, 200, 301/401/500/503, transient recovery, refused connection).
- Both production workflows now share the same concurrency group (previous groups allowed overlap). This does not replace Azure's own deployment lock and is not a fix for curl.
- CI now includes PostgreSQL tests and health helper/Compose validation; this is a proposed workflow change, not a claim GitHub CI already ran it.

## Operator verification — read-only, not executed on Azure by this task

Use an administrator session, not the restricted key whose forced command deploys automatically. Confirm actual paths first:

```sh
cd /opt/panaprisin
pwd
ls -l scripts/deploy.sh scripts/auto-deploy.sh
sha256sum scripts/deploy.sh scripts/auto-deploy.sh
bash -n scripts/deploy.sh
bash -n scripts/auto-deploy.sh
grep -nE 'curl|health|wait_for|failed|current|sha' scripts/deploy.sh scripts/auto-deploy.sh
```

Inspect source locally; redact credentials before sharing. Do not run `bash -x` on deploy scripts (executes deployment and can leak secrets). Inspect the existing Compose file path and state file paths from source; do not guess, source, or execute those files. Use `docker compose -f <verified-compose-file> ps` and limited `logs --tail=100` only after confirming the file. Inspect image identifiers via `docker inspect --format '{{.Config.Image}}' <verified-container-name>`, never dump full environment.

## Concrete replacement block — adapt after obtaining actual source

Review/install the new helper separately; keep old scripts backed up and checksums recorded. Replace only the existing health gate, using the verified health base URL (internal ingress host/port may differ from public TLS endpoint):

```bash
# Example integration; CHECK_HEALTH_SCRIPT and HEALTH_BASE_URL must be explicit
# values selected from the existing Azure configuration, not inferred here.
: "${CHECK_HEALTH_SCRIPT:?absolute path to reviewed check-health.sh}"
: "${HEALTH_BASE_URL:?verified http(s) origin}"
if ! bash "$CHECK_HEALTH_SCRIPT" "$HEALTH_BASE_URL"; then
  echo 'ERROR: Deployment health check failed' >&2
  exit 1
fi
# Existing successful-SHA/state update may run ONLY after this succeeds.
```

This is a safe replacement proposal, not an applicable unified diff: actual Azure script bodies are unavailable. Preserve backup/approval checks, deployment lock, existing failure handling, and state-write ordering. Do not edit auto-deploy state or blocked-SHA handling as part of the health fix. Review the final diff and `bash -n` before operator installation.

Verify helper independently with the actual origin: `bash <reviewed-helper-path> <verified-origin>`. It performs GETs only; it does NOT deploy, migrate, restart or update state. Record each endpoint's HTTP and curl exit code. If local/public hosts need Host headers or TLS trust settings, inspect ingress first; do not add `-k`, accept 3xx, or skip failing endpoints. Only after health and runtime image/migration state are independently reviewed should the operator decide recovery under a separate explicit approval.

Remaining: Azure source inspection, exact source-level patch, operator installation, real health verification and reconciliation of blocked/current SHA. No production state changed in this task.
