# Security Audit Report

**Date**: 2026-01-14
**Auditor**: QA/Auditor Agent
**Scope**: Full codebase security audit

## Executive Summary

A comprehensive security audit was performed on the Aptos Explorer codebase. Several security issues were identified and fixed.

## Security Findings

### Critical

- **None found**

### High Priority

1. **Hardcoded API Key Removed**
   - **Location**: `app/lib/constants.ts`
   - **Issue**: A fallback API key for shelbynet was hardcoded in the source code
   - **Fix**: Removed hardcoded API key, now requires environment variable `VITE_APTOS_SHELBYNET_API_KEY`
   - **Risk**: Exposed API key could be abused by malicious actors

### Medium Priority

2. **Missing `rel="noopener noreferrer"` on External Links**
   - **Locations**: Multiple files (see fixes below)
   - **Issue**: External links with `target="_blank"` were missing the security attribute
   - **Fix**: Added `rel="noopener noreferrer"` to all external links
   - **Risk**: Potential for reverse tabnabbing attacks where opened page could redirect the opener
   - **Files Fixed**:
     - `app/components/TitleHashButton.tsx`
     - `app/components/IndividualPageContent/LearnMoreTooltip.tsx`
     - `app/components/StyledTooltip.tsx`
     - `app/pages/DelegatoryValidator/TransactionSucceededDialog.tsx`
     - `app/pages/Account/Title.tsx`
     - `app/pages/Validators/StakingDrawer.tsx`
     - `app/pages/layout/Footer.tsx`
     - `app/pages/Transaction/helpers.tsx`

### Low Priority

3. **Insecure HTTP URL for External Website**
   - **Location**: `app/constants.tsx`
   - **Issue**: External website URL was using HTTP instead of HTTPS
   - **Fix**: Changed `http://securitize.io/...` to `https://securitize.io/...`
   - **Risk**: Mixed content warnings and potential MITM attacks

## Security Checklist Results

### Client-Side Security

- [x] No secrets in client code (uses `import.meta.env` for config)
- [x] No `dangerouslySetInnerHTML` with user data
- [x] External links now use `rel="noopener noreferrer"`
- [x] No sensitive data in localStorage (only cache data with TTL)
- [x] No `eval()` or `Function()` usage

### Wallet Interaction Security

- [x] Transaction parameters validated before signing
- [x] Network validation before wallet transactions
- [x] No automatic transaction signing
- [x] Uses official `@aptos-labs/wallet-adapter-react`

### API Security

- [x] API keys loaded from environment variables only
- [x] Rate limiting handled gracefully
- [x] Error messages don't leak sensitive info

### Security Headers (netlify.toml)

- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: restricts unnecessary APIs
- [x] X-XSS-Protection: 1; mode=block

### Dependencies

- [x] No known vulnerabilities (`pnpm audit` clean)

## Recommendations

1. **Completed**: Removed hardcoded API key fallback
2. **Completed**: Added `rel="noopener noreferrer"` to all external links
3. **Completed**: Changed HTTP to HTTPS for external URLs
4. **Suggestion**: Consider adding Content-Security-Policy header in `netlify.toml` for additional XSS protection

## Action Items

- [x] Remove hardcoded API key from `app/lib/constants.ts`
- [x] Add `rel="noopener noreferrer"` to all `target="_blank"` links
- [x] Change HTTP URLs to HTTPS
- [ ] Consider implementing Content-Security-Policy header

## Verification

- All linting passes: ✅
- All tests pass: ✅ (75/75 tests)
- No regressions introduced: ✅
