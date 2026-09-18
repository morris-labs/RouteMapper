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
- Independent code review (fresh Opus 5 agent, no prior context) found 11
  real issues; all fixed, deployed, and verified live. Worst one: a request
  with `avoid` as a non-array crashed the whole Express process (unhandled
  rejection outside the try block) -- confirmed exploitable with a single
  curl call before the fix, confirmed dead after. Full list of findings and
  fixes in the `git log` message for that commit. Also added nginx
  `limit_req` on the API path, since neither endpoint had any rate limiting
  despite spending quota on the Google server key with no auth.
- Fixed local-only: TLS private key and SSH key files in the working tree
  were `0664` (world-readable). `chmod 600`. Already gitignored/untracked,
  not a repo exposure, but no reason to leave them loose on disk.

## Next

Sister app work hasn't started -- `INTEGRATION.md` is prep for it, not a
sign work is underway. Revisit this file once that project has a name/repo
of its own; it may warrant its own `plan-<slug>.md` here or live separately.

## Blockers / decisions pending

- Google Cloud server-key daily quota cap: not configured anywhere. The new
  nginx rate limit caps abuse per-IP, but a distributed hammer or a legitimate
  traffic spike could still run up the bill. Needs a console visit, can't be
  set from here.
