# ADR 0003: Relyxus Obsidian is the only visual system

Status: proposed
Date: 2026-10-08

## Context

The UI/UX Master Design Specification v2.0 defines Sovereign Blue for actions, Insight
Violet for AI content and the Inter typeface. The later Relyxus Obsidian package and the
engineering contract (sections 20 to 22) replace that with true black and graphite
surfaces, monochrome AI authorship, no blue or violet, and IBM Plex Sans Variable. The
contract states the Obsidian decision overrides older visual styling and that blue or
violet branding must not be restored.

## Decision

- Colours come only from the Obsidian palette, exposed as `--rx-*` CSS custom properties
  and mapped into Tailwind theme names. Components never contain hex values.
- Semantic colour is reserved for operational meaning: Critical (SEV1, failures, PROD),
  Major (SEV2), Warning (degraded, near deadline, stale), Healthy (verified, succeeded).
- AI-authored content is marked with the monochrome AI marker plus the words "AI generated";
  it never uses a distinct hue.
- Typefaces: IBM Plex Sans Variable for interface text, IBM Plex Sans Arabic for Arabic,
  JetBrains Mono for technical content. All are bundled through Fontsource packages so
  nothing is fetched from a CDN at runtime.
- Behaviour, layout, interaction and accessibility rules still come from the UI/UX
  specification; only its visual tokens are superseded.

## Consequences

- The light theme is undefined until design publishes Obsidian light tokens (open question Q1).
- Prohibited patterns (glow, glassmorphism, gradients, neon, decorative animation, AI
  sparkle) are review blockers.
