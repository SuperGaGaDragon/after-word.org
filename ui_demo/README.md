# ui_demo（Cold 版本代码位置说明）

当前默认主题是 `cold`。下面是 `cold` 版本相关代码的全部位置。

## 1) 主题选择入口

- `ui_demo/src/components/AppShell.tsx`
  - `Style` 下拉（含 `dark/cold/warm/v2...v15`）
  - 主题值写入：`document.documentElement.setAttribute('data-theme', theme)`
  - 本地缓存：`localStorage` 的 `ui_demo_theme`

## 2) Cold 主题核心设计 Token（主定义）

- `ui_demo/src/styles.css`
  - `:root` 块（文件开头）
  - 这是 `cold` 的完整主设计系统：
    - 字体：`--font-body` / `--font-display`
    - 颜色：`--bg` / `--panel` / `--text` / `--accent` 等
    - 结构：`--radius-ui` / `--radius-card`
    - 深度：`--panel-shadow`

## 3) Cold 主题专属覆盖（当前要求）

- `ui_demo/src/styles.css`
  - `:root[data-theme='cold']`
  - 当前强制圆角：
    - `--radius-ui: 8px`
    - `--radius-card: 8px`

## 4) Cold Token 被使用的位置（样式消费层）

- `ui_demo/src/styles.css`
  - 全局：`body`（背景与字体）
  - 布局：`.app-root` / `.sidebar` / `.main-content`
  - 导航：`.nav-item`
  - 面板：`.panel` / `.sidebar-foot`
  - 控件：`button` / `.theme-select` / `textarea`
  - 内容卡片：`.row-card` / `.comment-card` / `.editor-surface`

## 5) 页面与路由（使用同一套 cold 样式）

- 路由入口：`ui_demo/src/App.tsx`
- 页面文件：
  - `ui_demo/src/pages/OverviewPage.tsx`
  - `ui_demo/src/pages/WorkbenchPage.tsx`
  - `ui_demo/src/pages/FeedbackPage.tsx`
  - `ui_demo/src/pages/VersionsPage.tsx`

## 6) 运行

```bash
cd /Users/alex_1/Desktop/afterword/ui_demo
npm run dev -- --host 0.0.0.0 --port 4177
```
