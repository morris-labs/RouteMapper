# Status

active plan: plan-routemapper.md (v1 complete -- Android and design system added)
current step: ready for GitHub push

## Done

- v1 built and deployed: live at https://morrislabs.app/routemapper/.
  Full build history in `plan-routemapper.md`.
- Deployment architecture, decisions, and every bug fixed in `DEPLOYMENT.md`.
- Release prep: `README.md`, `LICENSE` (MIT), secrets audit clean.
- Independent code review (Opus 5) found 11 real issues; all fixed.
- Native Android app (`mobile/`): Kotlin + Jetpack Compose + maps-compose.
  Two-tab layout (Plan / Map). Calls the same production backend.
- All 15 Android code review findings fixed (85a2759).
- Android: Maps navigation deep link (Google Maps URL handoff, pipe-encoding
  fix, avoid-settings passthrough, 11-stop cap with truncation note).
- Android: round-trip UI fixed -- Origin + Destination pinned at top, Other
  Stops section below with 2 default slots. No longer eats the destination.
- Autocomplete broadened: removed `includedPrimaryTypes` restriction so
  cities, states, and abbreviations (VA, OH) return suggestions.
- Web: feature parity with Android -- same Origin/Destination layout,
  default 4 address slots.
- MorrisLabs design system integrated: Syne/DM Sans/Space Mono fonts,
  `--ml-*` CSS tokens, sticky header with Apps dropdown, copyright footer.
  All sidebar components migrated from Tailwind slate/blue to ML tokens.
- morrislabs.app homepage built and deployed (separate repo).
- RouteMapper pushed to GitHub: https://github.com/morris-labs/RouteMapper

## Next

- Lock Android Maps key to package name + SHA-1 in Cloud Console
- Live device test (sideload debug APK)

## Blockers / decisions pending

- Google Cloud server-key daily quota cap: not configured. Nginx rate
  limit caps per-IP abuse; a distributed spike could still run up the bill.
- Android Maps key is currently unrestricted.
