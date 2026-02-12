# Frontend Structure Rules

1. Use vertical slices under `src/modules`.
2. One business route group owns its own page and related logic.
3. Current route modules:
- `src/modules/works`
- `src/modules/why`
- `src/modules/about`
- `src/modules/auth`
4. Shared UI for temporary route testing is in `src/modules/navigation/TestRouteSwitches.tsx`.
5. Router entry is `src/router.tsx`; app entry is `src/main.tsx`.
6. All comments tagged `TEST ONLY` are temporary and must be removed when real features land.
7. Keep route behavior first; add API/data wiring inside each module later, not in global files.
