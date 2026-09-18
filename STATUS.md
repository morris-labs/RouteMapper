# Status

active plan: plan-routemapper.md (v1 complete -- see its "Status" section)
current step: Android app built; pending live device test

## Done

- v1 built and deployed: live at https://morrislabs.app/routemapper/.
  Full build history in `plan-routemapper.md`; deployment architecture,
  decisions, and every bug fixed along the way in `DEPLOYMENT.md`.
- Release prep: `README.md`, `LICENSE` (MIT), secrets audit clean (no
  `.env`/`.pem`/`.key` tracked in git). No GitHub remote yet -- local only.
- Stop limit expanded from a UI-only 2-6 to 2-25, matching what the
  `POST /api/route` endpoint already accepted (Google's own Directions API
  waypoint cap).
- `INTEGRATION.md` added: API reference for a potential sister app.
- Independent code review (fresh Opus 5 agent) found 11 real issues; all
  fixed and deployed. Worst: unhandled rejection crashed the Express process
  on a malformed `avoid` field.
- Native Android app (`mobile/`) built: Kotlin + Jetpack Compose +
  maps-compose. Two-tab layout (Plan / Map). Calls the same production
  backend. Debug APK built at `mobile/app/build/outputs/apk/debug/app-debug.apk`.
  Maps key in `mobile/local.properties` (gitignored). Code review by fresh
  Opus agent in progress -- findings pending.

## Next

- Apply Android code review findings
- Live device test (sideload APK)
- Decide whether to push to a GitHub remote

## Blockers / decisions pending

- Google Cloud server-key daily quota cap: not configured. The nginx rate
  limit caps per-IP abuse but a distributed spike could still run up the bill.
  Needs a console visit.
- Android Maps key is currently unrestricted -- should be locked to package
  name + SHA-1 fingerprint once live testing confirms everything works.
