# After-Word 应用前端设计文档

## 1. 设计哲学

本设计旨在创造一个**现代、简约、专注**的写作环境。我们追求的目标是“内容为王”，UI 必须退居次席，为用户的创作过程提供无干扰的支持。设计语言借鉴了 Google Material Design 的精髓，强调清晰的层级、直观的交互和呼吸感十足的留白。

---

## 2. 色彩系统 (Color System)

色彩方案以中性色为主，营造一个平静、不刺眼的环境。强调色用于引导用户进行关键操作。

| 用途 | 颜色 | HEX | 备注 |
| :--- | :--- | :--- | :--- |
| **主背景 (Primary BG)** | 雪白 | `#FFFFFF` | 画布和主要内容区域的背景色，提供最大对比度。 |
| **二级背景 (Secondary BG)** | 淡灰 | `#F4F5F7` | 页面body的背景色，用于区分主内容区。 |
| **面板/卡片 (Surface)** | 雪白 | `#FFFFFF` | 所有卡片、面板的颜色，与主背景一致，通过阴影区分。 |
| **边框/分割线 (Border)** | 极淡灰 | `#EBECF0` | 用于列表项分割、输入框边框等， subtle and clean。 |
| | | | |
| **主强调色 (Accent Primary)** | 钴蓝 | `#3B82F6` | **核心交互元素**：按钮、高亮链接、激活状态。 |
| **强调色悬浮 (Accent Hover)** | 深钴蓝 | `#2563EB` | 主强调色按钮的 Hover 状态。 |
| | | | |
| **主文本 (Text Primary)** | 近黑 | `#172B4D` | 标题、正文等主要文字。 |
| **二级文本 (Text Secondary)**| 中灰 | `#6B778C` | 辅助信息、占位符、未激活的标签。 |
| **禁用文本 (Text Disabled)** | 浅灰 | `#A5ADBA` | 禁用状态的文字。 |
| **白色文本 (Text on Accent)**| 纯白 | `#FFFFFF` | 在强调色背景上使用的文字。 |

---

## 3. 字体与排版 (Typography)

选择清晰易读的无衬线字体，通过字号、字重和行高的组合，建立和谐的视觉层次。

*   **字体族 (Font Family)**: `Inter`。这是一款专为屏幕设计的现代字体，清晰度高。备用字体为系统默认无衬线字体 (`sans-serif`)。

| 元素 | 字重 (Weight) | 字号 (Size) | 行高 (Line Height) | 字母间距 (Spacing) |
| :--- | :--- | :--- | :--- | :--- |
| **H1 / 页面标题** | Bold (700) | `28px` | `36px` | `-0.02em` |
| **H2 / 组件标题** | Semi-Bold (600) | `20px` | `28px` | `-0.01em` |
| **正文 / 编辑器 (Body)** | Regular (400) | `16px` | `28px` (1.75) | `normal` |
| **按钮 / 标签 (Button/Label)** | Medium (500) | `14px` | `20px` | `normal` |
| **辅助文本 (Helper Text)** | Regular (400) | `12px` | `16px` | `normal` |

---

## 4. 布局与间距 (Layout & Spacing)

*   **基础间距单位**: **`8px`**。所有的 `padding`, `margin`, `gap` 都应是这个单位的倍数 (`8px`, `16px`, `24px`, `32px` ...)。这确保了视觉上的一致性和节奏感。
*   **栅格布局**: 沿用 `layout.html` 中的 `grid` 布局，但具体尺寸可微调，以适应更优雅的比例。
    *   左栏: `25%`
    *   右栏: `75%`
    *   栏间距 (gap): `24px`

---

## 5. 组件设计 (Component Design)

放弃 `layout.html` 中 `2px solid #000` 的硬朗风格，转向使用圆角和阴影来定义元素和层级。

*   **通用样式**
    *   **圆角 (Border Radius)**:
        *   小组件 (按钮, input): `8px`
        *   大卡片 (主编辑区, 历史列表区): `12px`
    *   **阴影 (Box Shadow)**: 使用多层平滑阴影营造深度。
        *   **标准卡片**: `0px 1px 2px rgba(0, 0, 0, 0.05), 0px 4px 12px rgba(0, 0, 0, 0.05)`
        *   **悬浮/拖拽时**: `0px 4px 8px rgba(0, 0, 0, 0.08), 0px 10px 24px rgba(0, 0, 0, 0.1)`

---

#### 方块 1: "New Work" 按钮
*   **类型**: 主操作按钮 (Primary Action)
*   **样式**:
    *   背景色: `var(--accent-primary)`
    *   文字颜色: `var(--text-on-accent)`
    *   内边距: `12px 24px`
    *   字号/字重: `14px` / `Medium (500)`
    *   圆角: `8px`
    *   边框: 无
*   **交互**:
    *   `cursor: pointer`
    *   悬浮 (`:hover`): 背景色变为 `var(--accent-hover)`, 阴影轻微加深。
    *   过渡: `transition: all 0.2s ease-in-out;`

#### 方块 2: Work 历史
*   **样式**:
    *   整体是一个卡片，应用**标准卡片**阴影和 `12px` 圆角。
    *   内部列表项之间用 `1px solid var(--border-color)` 分割。
    *   每个列表项 `padding`: `16px`。
*   **列表项交互**:
    *   悬浮 (`:hover`): 背景色变为 `var(--secondary-bg)`。
    *   激活 (`.active`): 背景色为 `var(--accent-primary)` 的 10% 透明度版本 (`#3B82F6` + `1A`)，左侧有一个 `3px` 宽的 `var(--accent-primary)` 竖条。
    *   过渡: `transition: background-color 0.2s ease;`

#### 方块 3: 编辑板
*   **样式**:
    *   应用**标准卡片**样式，但内部 `padding` 要大，建议 `32px`，为文字提供呼吸空间。
    *   内部 `textarea` 或富文本编辑器应无边框、无背景，完全融入卡片。
    *   光标颜色应为 `var(--accent-primary)`。

#### 方块 4: LLM Comment
*   **按钮样式**:
    *   类型: 次要操作按钮 (Secondary Action)
    *   样式: 边框 `1px solid var(--border-color)`, 文字颜色 `var(--text-primary)`, 背景色 `transparent`。
    *   内边距: `10px 20px`
    *   悬浮 (`:hover`): 背景色变为 `var(--secondary-bg)`。
*   **评论区浮窗**:
    *   一个可拖动、可缩放的浮动卡片。
    *   应用**悬浮/拖拽时**的阴影样式，以感觉它在其他内容之上。
    *   包含一个标题栏 (H2 样式, "AI Comments") 和一个可滚动的评论内容区。
    *   标题栏应有 `cursor: move` 的抓手图标。

#### 方块 6 & 7: 用户与关于
*   **样式**:
    *   作为次要链接/按钮处理。
    *   推荐使用无边框、无背景的文本按钮。
    *   文字颜色: `var(--text-secondary)`。
    *   悬浮 (`:hover`): 文字颜色变为 `var(--text-primary)`，可加下划线。
    *   `padding`: `8px 12px`。

#### 弹窗 (Modal)
*   **遮罩层 (Overlay)**: 半透明黑色背景, `rgba(17, 43, 77, 0.4)`。
*   **弹窗卡片**:
    *   居中显示，应用**标准卡片**样式。
    *   `padding`: `32px`。
    *   包含标题 (H2)、说明文字 (Body) 和操作按钮。

---

## 6. 动效与交互 (Animation & Interaction)

*   **原则**: 动效的目的是提供反馈和引导，而不是炫技。所有动效都应快速而平滑 (`~200ms`)。
*   **过渡 (Transitions)**:
    *   在所有可交互组件 (按钮、链接、列表项) 的 `:hover`, `:active`, `:focus` 状态变化时，应用 `transition` 属性。
    *   主要过渡属性: `background-color, color, box-shadow, transform`。
*   **微交互 (Micro-interactions)**:
    *   按钮点击时，可添加一个轻微的 `transform: scale(0.98)` 效果，释放后弹回。
    *   新元素（如 work 历史项、LLM 评论）出现时，可以使用一个微妙的 `fade-in` 和 `slide-up` 效果。

---
## 7. 总结

这份设计文档为 `after-word` 应用提供了一套完整、一致的视觉和交互规范。开发人员应以此为准绳，将抽象的布局方块转化为精致、可用、令人愉悦的用户界面。设计的核心是**克制**与**和谐**。