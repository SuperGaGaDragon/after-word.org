# Frontend Structure Rules

1. Use vertical slices under `src/modules`.
2. One business route group owns its own page and related logic.
3. Current route modules:
- `src/modules/works`
- `src/modules/why`
- `src/modules/about`
- `src/modules/auth`

modules下面，再分清楚，逻辑和UI严格分离。buttons和页面主逻辑严格分离。建议比如about/pages/components放按钮, pages/about.tsx放集成，然后about/utils，about/hooks这种等等分割在这个下面。
4. Shared UI for temporary route testing is in `src/modules/navigation/TestRouteSwitches.tsx`.
5. Router entry is `src/router.tsx`; app entry is `src/main.tsx`.
6. All comments tagged `TEST ONLY` are temporary and must be removed when real features land.
7. Keep route behavior first; add API/data wiring inside each module later, not in global files.
8. API contract rule: external request/response fields follow backend snake_case.
9. UI state can use camelCase, but conversion must happen only in module-level API adapters.
10. Submit flow rule: call submit first, then call versions detail by returned version to get analysis.
11. Save flow rule: always pass explicit `auto_save` in update requests.
