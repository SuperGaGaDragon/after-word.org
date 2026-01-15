# Phase1 Stage0 - Git Ignore + Commit Rule

## 目标
建立 git 忽略规则，防止任何环境变量被提交，并明确每个 stage 必须提交。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息
- 仓库地址：https://github.com/SuperGaGaDragon/after-word.org
- 禁止将任何环境变量文件提交到仓库。

## 任务清单
- [x] 在仓库根目录创建 `.gitignore`。
- [x] `.gitignore` 至少包含以下规则：
  - `.env`
  - `.env.*`
  - `*.env`
  - `config/.env`
- [x] 确认 `.gitignore` 已被 git 跟踪。

## 提交要求
- [x] 完成本 stage 后执行 `git add .gitignore`。
- [x] 提交命名必须为：`Phase1 Stage0`。
- [x] 确认无任何环境变量文件被提交。

## 自检
- [x] `.gitignore` 生效
