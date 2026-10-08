## Problem

<!-- The product, reliability, security or engineering problem this change solves. -->

## Solution

<!-- What behaviour changes for users or engineers. -->

## Implementation

<!-- Important architecture decisions and trade-offs. Do not just list files. -->

## Testing

<!-- Tests actually executed, with commands. State clearly anything that could not be run. -->

## Security and Permissions

<!-- Does this affect permissions, incident visibility, data exposure, authentication,
authorisation, policies, approvals or secrets? If not, say so explicitly. -->

## Database Changes

<!-- Frontend changes normally have none. State "None" or describe API contract impact. -->

## Operational Impact

<!-- Deployment impact, configuration changes, bundle size, self-hosted and air-gapped
considerations, observability impact. -->

## Rollback

<!-- How this change can be safely reverted. -->

## Related Requirement

<!-- Relyxus specification sections, e.g. "UI/UX Master Design Specification v2.0, section 10.4". -->

## Reviewer checklist

- [ ] Uses design tokens only; no hard-coded colours or sizes
- [ ] Strings externalised for English and Arabic; right-to-left layout checked
- [ ] Documented screen states handled (loading, empty, error, degraded, permission denied, restricted, read only)
- [ ] Keyboard path, visible focus and accessible names verified
- [ ] No secrets, tokens or restricted incident data exposed in UI, logs or fixtures
