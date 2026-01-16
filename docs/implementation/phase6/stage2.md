# Phase6 Stage2 - Frontend Manual QA Checklist

## 目标
提供前端手工测试清单，验证交互规则与权限约束。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [ ] 未登录：点击 New Work/历史/编辑/LLM 按钮，均弹窗“Signup / Login for full experience”。
- [ ] 未登录：编辑板不可编辑。
- [ ] 登录后：New Work 创建新 work，编辑板清空，LLM 区域隐藏。
- [ ] 登录后：历史列表切换加载正确内容，LLM 区域隐藏。
- [ ] 登录后：编辑板自动保存（30s），刷新页面内容不丢失。
- [ ] LLM Comment：点击后弹出可拖动浮窗，内容只读，评论与当前 work 绑定。
- [ ] 账号设置：改用户名/改密码成功；email 不可修改。

## 交付物（必须有）
- `docs/implementation/phase6/stage2.md`（本清单执行记录）

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase6 Stage2 - Frontend Manual QA Checklist`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] 手工测试已全部执行并勾选
