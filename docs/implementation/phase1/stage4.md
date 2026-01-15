# Phase1 Stage4 - Architecture Guardrails Checklist

## 目标
将核心架构禁区固化成清单，供后续开发自检。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 架构规则（来自总计划，必须遵守）
- Frontend 不能判断“是否允许编辑”，只能做 UI 状态。
- API 层禁止拼 prompt、禁止业务逻辑。
- LLM Gateway 不能访问 Storage，不能改系统状态。
- Work 未经过 Session/Lock 不得写入 Storage。
- Storage 不实现业务规则，不调用任何业务组件。

## 任务清单
- [x] 在 `backend/docs/architecture_guardrails.md` 写入上述规则（供开发对照）。
- [x] 在 `backend/modules/` 根目录放置 `README.md`，简述组件依赖方向（Frontend -> API -> Components -> Storage）。

## 交付物（必须有）
- `backend/docs/architecture_guardrails.md`
- `backend/modules/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase1 Stage4 - Architecture Guardrails Checklist`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
- [x] 规则完整无遗漏
