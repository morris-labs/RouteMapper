# Handoff for next session

## Start here

1. Read `STATUS.md` -- current position and next actions.
2. Read `CLAUDE.md` -- project overview, stack, env vars, dev commands.
3. Read memory index: `~/.claude/projects/-home-prime-Bin-RouteMapper/memory/MEMORY.md`

## Where things stand

RouteMapper is live at https://morrislabs.app/routemapper/ and pushed to
https://github.com/morris-labs/RouteMapper (branch: `main`, commit `da93e73`).

The app is feature-complete for the v1 scope. The two remaining items are
both in STATUS.md under "Next":

- **Lock Android Maps key**: go to Google Cloud Console, restrict the key
  bound to `com.morrislabs.routemapper` to that package name + the debug
  keystore SHA-1. The key is in `mobile/local.properties` (gitignored).
- **Live device test**: build and sideload the debug APK to a physical
  Android device.

## Key files

| File | Purpose |
|---|---|
| `STATUS.md` | Live position (read first) |
| `CLAUDE.md` | Project overview, stack, env setup |
| `DEPLOYMENT.md` | EC2 architecture, nginx, deploy steps |
| `SITE-DESIGN.md` | MorrisLabs design tokens, fonts, header/footer |
| `INTEGRATION.md` | API reference for external consumers |
| `github.env` | GitHub PAT -- gitignored, do not commit |

## GitHub / deploy

- **GitHub**: `gh` CLI is installed and authenticated as `morris-labs`.
  Use `gh` for all GitHub operations. For `git push`, source `github.env`
  and temporarily embed the token in the remote URL, then reset it after.
- **EC2 deploy**: SSH connection info is in memory at
  `~/.claude/projects/-home-prime-Bin-RouteMapper/memory/reference_deploy.md`.
  Deploy steps are in `DEPLOYMENT.md`.

## Working style notes

- Read `~/.claude/projects/-home-prime-Bin-RouteMapper/memory/MEMORY.md`
  for all saved preferences before starting work.
- Global style guide is in `~/.claude/CLAUDE.md`.
