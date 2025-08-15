# Project: ADHD Learning Hub (MVP, Guest Mode)

Goal: a web app for ADHD-friendly studying — Resources manager, Timer & Sessions, Goals, Stats, Export/Import; dark/light mode. Deploy later on Cloudflare Pages. Code must be beginner-friendly.

Pages:
- `/` Dashboard (Timer + quick stats)
- `/resources` CRUD + search/filter + “Surprise Me”
- `/goals` CRUD + progress %
- `/stats` today/7d/all-time minutes, resources by status, streak
- `/settings` theme toggle + Export/Import JSON

Data model (guest mode in localStorage):
- `Resource { id, title, url, subject, type, priority, notes, favorite, status, nextReviewDate, createdAt, updatedAt }`
- `Session  { id, startedAt, durationMin, subject?, resourceId? }`
- `Goal     { id, name, subject, dueDate, progressPct, status, createdAt, updatedAt }`
- `settings { theme: "dark"|"light", xp?:number, level?:number, streak?:number }`

Non-negotiables:
- Tailwind UI, accessible, keyboard shortcuts.
- Timer persists during refresh; Space = start/pause.
- Export/Import JSON replaces in-memory + localStorage.
- “Surprise Me” opens a random visible resource in a new tab.

Roadmap later (not in MVP): Cloud sync (Cloudflare D1), email reminders, Focus Mode, Ollama assistant.
