# Frontend Design System - Cold Theme

## 设计理念概述

**AfterWord Iteration Lab** 采用 **Cold** 主题作为核心设计语言，构建了一个专业、清晰、科技感的 AI 辅助写作迭代平台界面。设计系统基于 **Design Token** 架构，通过 CSS 变量实现了高度可维护和可扩展的视觉系统。

**核心设计原则**：
- **专业克制**：避免过度设计，专注于内容和功能
- **系统化**：统一的设计token驱动所有视觉元素
- **透明层叠**：利用半透明和color-mix创造深度
- **响应式优先**：移动端到桌面端的流畅适配

---

## 设计系统架构

### Token System（设计令牌系统）

所有视觉设计通过 CSS 自定义属性（CSS Variables）定义在 `:root` 中，形成单一真实来源（Single Source of Truth）。

**架构层次**：
```
:root（基础token定义）
  ↓
:root[data-theme='cold']（主题特定覆盖）
  ↓
Component Classes（组件级消费）
```

**代码位置**：`ui_demo/src/styles.css` 第1-30行

```css
:root {
  /* 字体系统 */
  --font-body: 'Manrope', sans-serif;
  --font-display: 'Space Grotesk', sans-serif;

  /* 结构系统 */
  --radius-ui: 12px;        /* UI控件圆角 */
  --radius-card: 18px;      /* 卡片圆角 */

  /* 深度系统 */
  --panel-shadow: 0 14px 45px color-mix(in srgb, var(--text) 12%, transparent);

  /* 颜色系统（完整palette见下文） */
  --bg: #f4f6fb;
  --panel: rgba(255, 255, 255, 0.82);
  --text: #142343;
  --accent: #1769ff;
  /* ... */
}
```

---

## 字体系统（Typography）

### 字体族选择

**正文字体**：`Manrope` - 现代几何无衬线字体
- 特点：清晰易读，数字识别度高
- 用途：正文、段落、说明文字、表单输入

**展示字体**：`Space Grotesk` - 复古科技风格
- 特点：独特的几何结构，科技感强
- 用途：页面标题、品牌标题、重要数字

### 使用规范

**品牌区**（Sidebar头部）：
```
.brand-kicker: 大写字母间距0.2em, 0.68rem, accent色
.brand-title: Space Grotesk, 1.8rem
.brand-subtitle: 0.9rem, muted色
```

**页面标题**：
```
.eyebrow: 大写, 字母间距0.16em, 0.72rem, accent色
h2: Space Grotesk, 字母间距0.01em
```

**代码位置**：`ui_demo/src/styles.css` 第7-8行（定义），第497-515行（应用）

---

## 颜色系统（Color Palette）

### 主色板（Cold Theme）

**背景层**：
```css
--bg: #f4f6fb                      /* 基础背景 - 浅蓝灰 */
--bg-grad-a: rgba(90,143,255,0.2)  /* 渐变点A - 蓝色光晕 */
--bg-grad-b: rgba(49,200,170,0.16) /* 渐变点B - 青色光晕 */
--bg-grad-c: rgba(255,177,106,0.15)/* 渐变点C - 暖橙光晕 */
```

**表面层**：
```css
--sidebar-bg: rgba(255,255,255,0.88)  /* 侧边栏 - 半透明白 */
--panel: rgba(255,255,255,0.82)       /* 面板 - 半透明白 */
--surface: rgba(246,250,255,0.9)      /* 编辑器表面 */
--row-bg: rgba(248,251,255,0.95)      /* 行背景 */
```

**文字层**：
```css
--text: #142343     /* 主文字 - 深蓝灰 */
--muted: #5f6f93    /* 次要文字 - 中灰蓝 */
```

**强调色**：
```css
--accent: #1769ff     /* 主强调 - 蓝色 */
--accent-2: #00b894   /* 次强调 - 青绿 */
--warn: #b88900       /* 警告 - 金黄 */
--ok: #038f71         /* 成功 - 青色 */
```

**边框与轨道**：
```css
--sidebar-border: rgba(36,66,122,0.12)
--panel-border: rgba(58,92,160,0.15)
--track: rgba(23,105,255,0.12)
```

**代码位置**：`ui_demo/src/styles.css` 第6-30行

### 颜色使用场景

**渐变背景**（第470-474行）：
```css
body {
  background:
    radial-gradient(circle at 15% 10%, var(--bg-grad-a), transparent 35%),
    radial-gradient(circle at 85% 20%, var(--bg-grad-b), transparent 30%),
    radial-gradient(circle at 50% 80%, var(--bg-grad-c), transparent 35%),
    var(--bg);
}
```

**渐变按钮**（第651行）：
```css
button {
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
}
```

**Color-mix 半透明**（应用于nav-item、panels等）：
```css
background: color-mix(in srgb, var(--panel) 70%, transparent);
```

---

## 结构系统（Layout & Structure）

### 圆角规范

**Cold主题强制圆角**（第58-61行）：
```css
:root[data-theme='cold'] {
  --radius-ui: 8px;     /* UI控件（按钮、输入框、导航项） */
  --radius-card: 8px;   /* 卡片、面板 */
}
```

**注意**：Cold主题强制覆盖了默认值（12px/18px）为统一的8px，营造更紧凑、专业的视觉风格。

### 深度系统（Depth & Elevation）

**阴影定义**（第11行）：
```css
--panel-shadow: 0 14px 45px color-mix(in srgb, var(--text) 12%, transparent);
```

**分层结构**：
```
Layer 0: body背景（渐变）
  ↓
Layer 1: sidebar（半透明白 + 边框）
  ↓
Layer 2: panel（半透明白 + 阴影 + 边框）
  ↓
Layer 3: row-card / comment-card（更浅的背景）
  ↓
Layer 4: button / pill（渐变或纯色）
```

**代码位置**：
- Panel: 第615-621行
- Sidebar: 第489-495行
- Row-card: 第668-678行

---

## 布局系统（Grid-Driven Layout）

### 应用级布局

**两栏布局**（第482-487行）：
```css
.app-root {
  display: grid;
  grid-template-columns: 300px 1fr;  /* 固定侧边栏 + 弹性主区 */
  min-height: 100vh;
}
```

### 组件级布局

**Metric Grid - 三列指标**（第609-613行）：
```css
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
```

**Editor Grid - 编辑器布局**（第718-722行）：
```css
.editor-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;  /* 编辑器:侧栏 = 1.6:1 */
  gap: 1rem;
}
```

**Bento Grid - 卡片网格**（第824-836行）：
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}
.bento-main {
  grid-column: span 2;  /* 主卡片占2列 */
}
```

**Timeline Layout - 时间轴**（第782-786行）：
```css
.timeline-item {
  display: grid;
  grid-template-columns: 16px 1fr;  /* 点标记 + 内容 */
  gap: 0.9rem;
}
```

### 响应式断点

**移动端适配**（第921-945行）：
```css
@media (max-width: 1024px) {
  .app-root {
    grid-template-columns: 1fr;  /* 单列布局 */
  }
  .metric-grid,
  .editor-grid,
  .bento-grid {
    grid-template-columns: 1fr;  /* 所有grid改为单列 */
  }
}
```

---

## 组件系统（Component Library）

### 导航组件

**Nav Item**（第522-537行）：
```css
.nav-item {
  border: 1px solid transparent;
  border-radius: var(--radius-ui);
  padding: 0.75rem 0.9rem;
  background: color-mix(in srgb, var(--panel) 70%, transparent);
  transition: 180ms ease;
}
.nav-item:hover,
.nav-item.active {
  border-color: var(--panel-border);
  background: color-mix(in srgb, var(--accent) 18%, var(--panel));
  transform: translateY(-1px);  /* 微妙的上浮效果 */
}
```

**特点**：
- 半透明背景营造层次感
- hover和active状态混入accent色
- 轻微的translate动画提升交互反馈

### 按钮系统

**Primary Button**（第647-655行）：
```css
button {
  border: none;
  border-radius: var(--radius-ui);
  padding: 0.56rem 0.92rem;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  color: var(--button-text);
  font-weight: 700;
  cursor: pointer;
}
```

**Ghost Button**（第657-661行）：
```css
button.ghost {
  background: color-mix(in srgb, var(--panel) 85%, transparent);
  color: var(--text);
  border: 1px solid var(--panel-border);
}
```

### Panel系统

**基础Panel**（第615-621行）：
```css
.panel {
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-card);
  padding: 1rem;
  background: var(--panel);
  box-shadow: var(--panel-shadow);
}
```

**Panel Header**（第635-645行）：
```css
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: center;
  margin-bottom: 0.8rem;
}
```

### Card系统

**Row Card**（第668-678行）：
```css
.row-card {
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-ui);
  padding: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
  background: var(--row-bg);
}
```

**使用场景**：Work队列列表、文件列表等

**Comment Card**（第669-678行）：
```css
.comment-card {
  /* 同row-card样式 */
}
```

**使用场景**：Sentence comment列表展示

### Pill标签系统

**基础Pill**（第691-698行）：
```css
.pill {
  border-radius: 999px;
  padding: 0.3rem 0.65rem;
  font-size: 0.78rem;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--text);
  border: 1px solid var(--panel-border);
}
```

**状态变体**：
```css
.pill.lock { /* 锁定状态 - 金黄色 */ }
.pill.warn { /* 警告状态 - 红粉色 */ }
.pill.ok   { /* 成功状态 - 青绿色 */ }
```

**代码位置**：第691-716行

### 进度条系统

**Progress Track**（第733-745行）：
```css
.progress-track {
  height: 10px;
  border-radius: 999px;
  background: var(--track);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  width: 76%;  /* 动态值 */
  background: linear-gradient(120deg, var(--accent), #81ecff);
}
```

### Timeline组件

**Timeline Item**（第782-794行）：
```css
.timeline-item {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 0.9rem;
}
.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  margin-top: 0.4rem;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
}
```

### 表单组件

**Textarea**（第764-775行）：
```css
textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border-radius: var(--radius-ui);
  border: 1px solid var(--panel-border);
  background: var(--surface);
  color: var(--text);
  padding: 0.72rem;
  font: inherit;  /* 继承字体 */
}
```

**Editor Surface**（第724-731行）：
```css
.editor-surface {
  border: 1px solid var(--panel-border);
  background: var(--surface);
  min-height: 240px;
  border-radius: var(--radius-ui);
  padding: 1rem;
}
```

---

## 页面结构设计

### 页面模板

所有页面遵循统一的结构模板：

```tsx
<section className="page">
  <header className="page-head">
    <p className="eyebrow">分类标签</p>
    <h2>页面标题</h2>
  </header>

  {/* 页面特定内容 */}
</section>
```

**代码位置**：
- OverviewPage: `ui_demo/src/pages/OverviewPage.tsx`
- WorkbenchPage: `ui_demo/src/pages/WorkbenchPage.tsx`
- FeedbackPage: `ui_demo/src/pages/FeedbackPage.tsx`
- VersionsPage: `ui_demo/src/pages/VersionsPage.tsx`

### Overview Page（概览页）

**设计目标**：高层次的数据仪表盘

**布局结构**：
1. **Metric Grid**（三列指标卡）：
   - Active Works / Submitted Versions / Resolved Comments
   - 大数字 + 趋势标签

2. **Work Queue Panel**：
   - 表头：标题 + "Create Work"按钮
   - Row-card列表：work标题、字数、更新时间、状态pill

**代码位置**：`ui_demo/src/pages/OverviewPage.tsx` 第1-52行

### Workbench Page（工作台页）

**设计目标**：编辑器主界面 + 提交流程提示

**布局结构**（Editor Grid 1.6:1）：
1. **左侧 - 编辑器Panel**：
   - Panel Head：标题 + pill标签（设备锁定、自动保存）
   - Editor Surface：文本内容区
   - Progress Track：草稿回放进度条

2. **右侧 - 提交守卫Panel**：
   - 规则列表（ul.clean-list）
   - CTA按钮："Submit For New AI Evaluation"

**代码位置**：`ui_demo/src/pages/WorkbenchPage.tsx` 第1-44行

### Feedback Page（反馈页）

**设计目标**：AI评审结果的处理工作流

**布局结构**（垂直堆叠）：
1. **FAO Comment Panel**：
   - 整体评价段落（.lead）

2. **Sentence Comments Panel**：
   - Panel Head：标题 + 状态pill（pending数量）
   - Comment-card列表：
     - 句子引用 + 评论 + 元数据
     - 操作按钮：Resolved / Reject

3. **Reflection Panel**：
   - Textarea：用户反思输入
   - 字符计数：X/220 chars

**交互逻辑**：
- 所有comment必须标记为Resolved或Rejected
- Pending计数实时更新
- 状态pill颜色变化：warn（有待处理） → ok（全部处理）

**代码位置**：`ui_demo/src/pages/FeedbackPage.tsx` 第1-82行

### Versions Page（版本页）

**设计目标**：版本历史时间轴可视化

**布局结构**（Timeline）：
- Timeline-item列表：
  - 左侧：timeline-dot（渐变圆点）
  - 右侧：Panel
    - Panel Head：版本号 + 类型pill
    - 版本说明
    - 时间戳

**代码位置**：`ui_demo/src/pages/VersionsPage.tsx` 第1-29行

---

## 交互设计规范

### Hover状态

**导航项**：
```css
.nav-item:hover {
  border-color: var(--panel-border);
  background: color-mix(in srgb, var(--accent) 18%, var(--panel));
  transform: translateY(-1px);
}
```

**原则**：
- 轻微的translateY提升层次感
- 混入accent色表示可交互
- 过渡时间180ms保持流畅

### 激活状态

**Tab Chip**（第872-884行）：
```css
.tab-chip.active {
  border-color: transparent;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  color: #fff;
}
```

**特点**：激活状态使用渐变背景 + 白色文字

### 状态反馈

**Pill系统的语义化颜色**：
- `.pill`（默认）：信息状态
- `.pill.lock`：锁定/警示（金黄）
- `.pill.warn`：警告/待处理（红粉）
- `.pill.ok`：成功/完成（青绿）

**Progress Indicator**：
- 使用渐变填充表示进度
- Track背景使用track token（低透明度accent）

---

## 主题切换架构

### 实现机制

**Theme Storage**（`ui_demo/src/components/AppShell.tsx` 第55-66行）：
```tsx
const [theme, setTheme] = useState<ThemeName>(() => {
  const saved = localStorage.getItem('ui_demo_theme')
  if (saved && themeOptions.includes(saved as ThemeName)) {
    return saved as ThemeName
  }
  return 'cold'  // 默认cold主题
})

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('ui_demo_theme', theme)
}, [theme])
```

**CSS选择器**：
```css
:root[data-theme='cold'] {
  /* cold专属覆盖 */
}
```

### 主题选择器UI

**代码位置**：`ui_demo/src/components/AppShell.tsx` 第96-111行

```tsx
<div className="theme-switch">
  <label htmlFor="theme-select">Style</label>
  <select
    id="theme-select"
    className="theme-select"
    value={theme}
    onChange={(event) => setTheme(event.target.value as ThemeName)}
  >
    {themeOptions.map((option) => (
      <option key={option} value={option}>
        {option === 'cold' ? 'Cold（暂定）' : option.toUpperCase()}
      </option>
    ))}
  </select>
</div>
```

---

## 设计token完整索引

### 字体Token
```css
--font-body: 'Manrope', sans-serif;
--font-display: 'Space Grotesk', sans-serif;
```

### 结构Token
```css
--radius-ui: 8px;     /* cold主题覆盖 */
--radius-card: 8px;   /* cold主题覆盖 */
```

### 深度Token
```css
--panel-shadow: 0 14px 45px color-mix(in srgb, var(--text) 12%, transparent);
```

### 颜色Token（完整列表）
```css
/* 背景 */
--bg: #f4f6fb;
--bg-grad-a: rgba(90, 143, 255, 0.2);
--bg-grad-b: rgba(49, 200, 170, 0.16);
--bg-grad-c: rgba(255, 177, 106, 0.15);

/* 表面 */
--sidebar-bg: rgba(255, 255, 255, 0.88);
--sidebar-border: rgba(36, 66, 122, 0.12);
--panel: rgba(255, 255, 255, 0.82);
--panel-border: rgba(58, 92, 160, 0.15);
--surface: rgba(246, 250, 255, 0.9);
--row-bg: rgba(248, 251, 255, 0.95);

/* 文字 */
--text: #142343;
--muted: #5f6f93;

/* 强调 */
--accent: #1769ff;
--accent-2: #00b894;
--warn: #b88900;
--ok: #038f71;

/* 按钮 */
--button-text: #f9fcff;

/* 轨道 */
--track: rgba(23, 105, 255, 0.12);
```

---

## 设计系统使用指南

### 添加新组件

1. **使用现有token**：优先使用已定义的CSS变量
2. **遵循圆角规范**：UI控件用`var(--radius-ui)`，卡片用`var(--radius-card)`
3. **利用color-mix**：创建半透明和混合色，而非硬编码rgba
4. **保持Grid优先**：布局使用`display: grid`而非flex（除非有特定需求）

### 示例：创建新的Info Card

```css
.info-card {
  /* 结构 */
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-card);
  padding: 1rem;

  /* 颜色 */
  background: var(--panel);
  color: var(--text);

  /* 深度 */
  box-shadow: var(--panel-shadow);
}

.info-card:hover {
  background: color-mix(in srgb, var(--accent) 8%, var(--panel));
  transform: translateY(-2px);
  transition: 180ms ease;
}
```

### 主题扩展

如需添加新主题变体：

1. 在`AppShell.tsx`的`ThemeName`类型添加新主题名
2. 在`styles.css`添加`:root[data-theme='new-theme']`块
3. 覆盖必要的token（字体、颜色、圆角等）

---

## 可访问性考虑

### 语义化HTML

所有页面使用语义化标签：
- `<section>` - 页面容器
- `<header>` - 页面头部
- `<article>` - 独立内容块（panel）
- `<nav>` - 导航区

### 色彩对比度

**Cold主题对比度**：
- 主文字（#142343）对白色背景：符合WCAG AA标准
- 次要文字（#5f6f93）对白色背景：符合WCAG AA标准
- 按钮文字（#f9fcff）对accent渐变：符合WCAG AA标准

### 交互反馈

- 所有按钮有`:hover`状态
- 激活状态明确标识（`.active`类）
- Focus状态（浏览器默认，可根据需要增强）

---

## 性能优化

### CSS架构

**优势**：
- 所有样式在单文件`styles.css`中，减少HTTP请求
- CSS变量运行时切换主题，无需重新加载样式表
- 使用`color-mix()`而非预定义的rgba值，减少代码冗余

### 动画性能

**使用transform**：
```css
.nav-item:hover {
  transform: translateY(-1px);  /* GPU加速 */
}
```

避免触发layout的属性（如`top`、`left`）。

---

## 设计系统维护

### 文件结构

```
ui_demo/
├── src/
│   ├── styles.css              # 设计系统核心
│   ├── components/
│   │   └── AppShell.tsx        # 主题切换逻辑
│   └── pages/
│       ├── OverviewPage.tsx    # 组件应用示例
│       ├── WorkbenchPage.tsx
│       ├── FeedbackPage.tsx
│       └── VersionsPage.tsx
```

### 更新流程

**修改Cold主题**：
1. 编辑`styles.css`第58-61行的`:root[data-theme='cold']`块
2. 如需修改全局默认值，编辑第6-30行的`:root`块
3. 测试所有页面的视觉一致性

**添加新组件样式**：
1. 在`styles.css`末尾添加新类
2. 使用CSS变量引用token
3. 确保响应式断点支持（第921-945行）

---

## 参考资源

**代码位置总览**：
- 设计Token定义：`ui_demo/src/styles.css` 第1-61行
- Cold主题覆盖：`ui_demo/src/styles.css` 第58-61行
- 组件样式库：`ui_demo/src/styles.css` 第462-920行
- 主题切换逻辑：`ui_demo/src/components/AppShell.tsx`
- 页面布局示例：`ui_demo/src/pages/*.tsx`

**设计哲学**：
- **少即是多**：避免过度装饰，专注于清晰的信息传达
- **一致性第一**：通过token系统确保全局视觉统一
- **灵活可扩展**：基于变量的架构支持快速主题迭代

---

**文档版本**: 1.0
**最后更新**: 2025-02-12
**设计系统名称**: AfterWord Iteration Lab - Cold Theme
**技术栈**: React + TypeScript + CSS Variables
