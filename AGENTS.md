<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Git workflow (effective 2026-10-08)

- NEVER push to `main`. All work is committed to a feature branch (or `dev`) and pushed to `origin/<branch>` only.
- The repository owner merges into `main` manually — do not merge, fast-forward, or force-push `main` yourself.
- Run builds/tests before pushing so `main` stays deployable when the owner merges.
