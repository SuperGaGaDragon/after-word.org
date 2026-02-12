# AfterWord UI Demo

This is a pure frontend React demo (no backend integration), built from `docs/backend/functions.md`.

## Theme reference selected

Primary inspiration (free + open source):
- Cruip Mosaic Lite (React/Tailwind dashboard style): https://github.com/cruip/tailwind-dashboard-template

Why selected:
- Free edition available.
- Open source on GitHub.
- Modern 2025 visual language (glass panels, strong gradients, dashboard UX patterns).

## Routes in demo

- `/` overview dashboard (works queue + product KPIs)
- `/workbench` draft editing + lock + submit guardrail UI
- `/feedback` FAO comment + sentence comments resolution + reflection input
- `/versions` submitted vs draft timeline

## Run

```bash
npm run dev -- --host 127.0.0.1 --port 4177
```
