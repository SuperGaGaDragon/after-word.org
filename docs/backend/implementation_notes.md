# Backend Implementation Notes

本文档记录实际实现与原计划（detailed_plan.md 和 backend_plan.md）的差异。

---

## Phase 6: AI评价 - Analyzer

### 差异1: 使用OpenAI JSON Mode

**原计划：**
- 只在prompt文本中要求LLM返回JSON
- 没有提到使用任何OpenAI特性来强制JSON格式

**实际实现：**
- 使用了OpenAI的 **JSON Mode**：`response_format={"type": "json_object"}`
- 在 `client.py` 中新增 `generate_structured_response()` 函数
- 保证LLM返回valid JSON，减少解析错误

**理由：**
1. OpenAI的JSON Mode保证返回可解析的JSON
2. 避免LLM返回markdown包裹的JSON（```json ... ```）
3. 减少解析错误和异常处理复杂度
4. 对于复杂嵌套结构（sentence_comments数组）更可靠

**影响：**
- ✅ 提高了系统可靠性
- ✅ 简化了错误处理逻辑
- ⚠️ 需要OpenAI API支持（gpt-3.5-turbo及以上版本支持）

---

## 未来可能的差异

（记录后续phase中的实现差异）

---

## 技术选择说明

### 为什么不用Function Calling？

Function Calling适合：
- 固定的、预定义的操作
- 简单的参数结构

我们的场景不适合：
- `sentence_comments` 是动态长度的数组（最多10个，但具体数量不定）
- 每个comment有复杂的嵌套结构
- `improvement_feedback` 是条件性字段（只在某些comment中出现）

### 为什么不用Structured Outputs？

Structured Outputs需要完整的JSON Schema定义，对我们的场景：
- 过于严格，增加复杂度
- 需要维护详细的schema定义
- JSON Mode已经足够满足需求

---

## 版本信息

- 文档创建时间：2026-02-11
- 最后更新：Phase 6实现时
