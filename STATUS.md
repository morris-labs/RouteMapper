# Status

active plan: plan-routemapper.md (v1 complete -- see its "Status" section)
current step: prepping for a sister app integration

## Done

- v1 built and deployed: live at https://morrislabs.app/routemapper/.
  Full build history in `plan-routemapper.md`; deployment architecture,
  decisions, and every bug fixed along the way in `DEPLOYMENT.md`.
- Release prep: `README.md`, `LICENSE` (MIT), secrets audit clean (no
  `.env`/`.pem`/`.key` tracked in git). No GitHub remote yet -- local only.
- Stop limit expanded from a UI-only 2-6 to 2-25, matching what the
  `POST /api/route` endpoint already accepted (Google's own Directions API
  waypoint cap). Changed `MAX_STOPS` in `AddressCardList.jsx`, the sidebar
  copy in `App.jsx`, and the stale "4-6"/"2-6" references in
  `README.md`/`CLAUDE.md`. `plan-routemapper.md`'s Goal section keeps the
  original "4-6" language as a historical record of the original ask.
- `INTEGRATION.md` added: API reference (endpoints, request/response shapes,
  CORS/auth posture) for a second agent building the planned sister app
  against RouteMapper, without needing to read the codebase.

## Next

Sister app work hasn't started -- `INTEGRATION.md` is prep for it, not a
sign work is underway. Revisit this file once that project has a name/repo
of its own; it may warrant its own `plan-<slug>.md` here or live separately.

## Blockers / decisions pending

None.
