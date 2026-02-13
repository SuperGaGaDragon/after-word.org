# Content Editor Text Highlighting Bug

## 问题描述

在 `HighlightedTextEditor` 组件中，文本高亮功能存在严重缺陷：

### 症状

1. **高亮标记悬浮固定**
   - 高亮标记（蓝色条）不随文本滚动而移动
   - 始终固定在编辑器顶部
   - 用户滚动时，高亮与实际文本位置不匹配

2. **高亮标记不跟随文字**
   - 高亮位置与对应文本脱节
   - 只能看到固定的蓝色矩形条
   - 无法准确定位评论对应的文本片段

3. **文字内容不可见**
   - 编辑器中只显示高亮占位符
   - 实际文字内容被透明化处理
   - 用户体验极差

## 问题原因

### 当前实现架构

```tsx
<div className="highlighted-text-editor editable">
  <textarea className="editor-textarea" />  {/* z-index: 1, 可见文本 */}
  <div className="text-overlay">           {/* z-index: 0, 绝对定位 */}
    {/* 高亮标记层 */}
  </div>
</div>
```

### 技术缺陷

#### 1. 绝对定位问题
```css
.text-overlay {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  pointer-events: none;
  color: transparent;  /* 文字透明，只显示背景高亮 */
  z-index: 0;
}
```

**问题**：
- `position: absolute` 使 overlay 脱离文档流
- 不会随父容器的滚动而移动
- 与 `textarea` 的滚动完全不同步

#### 2. 字符位置计算不可靠
- Textarea 的字符渲染位置由浏览器内部控制
- 换行、字体渲染、缩放都会影响位置
- 无法通过 `start_index` 和 `end_index` 准确计算像素位置

#### 3. 滚动同步问题
- Textarea 有自己的滚动状态
- Overlay 层无法获取 textarea 的 scrollTop
- 即使监听滚动事件，也难以精确同步

#### 4. 层叠方案的根本矛盾
- Textarea 是原生表单元素，不支持内部 HTML 标记
- 通过叠加层实现高亮，需要完美的位置同步
- Textarea 的文本渲染机制是黑盒，外部无法精确控制

---

## 改进方案

### 方案1：分离编辑和查看模式（推荐）

#### 设计思路
将编辑状态和查看状态分离，在不同场景使用不同的渲染方式。

#### 实现细节

**编辑模式（当前正在写作）**：
```tsx
// 纯 textarea，无高亮
<textarea
  className="content-editor"
  value={content}
  onChange={handleChange}
/>
```

**查看模式（查看已提交版本）**：
```tsx
// 只读文本 + 高亮标记
<div className="content-viewer">
  {renderHighlightedText(content, comments)}
</div>
```

**触发场景**：
- 编辑模式：用户正在编写/修改内容
- 查看模式：
  - 点击版本历史中的已提交版本
  - 查看 AI 分析结果
  - 对比不同版本

#### 优点
✅ **实现简单**：分离关注点，各司其职
✅ **性能好**：编辑时无额外开销
✅ **用户体验佳**：编辑时专注写作，查看时清晰展示
✅ **可靠性高**：避免了同步问题

#### 缺点
❌ 编辑时无法看到高亮（但这可能是优点，避免干扰写作）
❌ 需要额外的 UI 切换（版本查看功能）

#### 实施步骤
1. 保留当前 textarea 作为编辑器
2. 创建新的 `ContentViewer` 组件用于只读展示
3. 在 `WorkDetailPage` 添加"查看版本"功能
4. 切换到查看模式时显示 ContentViewer

---

### 方案2：仅在评论卡片中显示高亮片段

#### 设计思路
左侧保持纯文本编辑器，右侧评论卡片显示原文引用和高亮。

#### 实现细节

**左侧编辑器**：
```tsx
// 纯 textarea，简洁流畅
<textarea value={content} onChange={handleChange} />
```

**右侧评论卡片**：
```tsx
<div className="comment-card">
  <div className="original-text-highlight">
    {/* 显示高亮的原文片段 */}
    <span className="highlight-medium">
      "Is it simply a contest of skill or a bridge between souls?"
    </span>
  </div>
  <div className="comment-body">
    <strong>Issue:</strong> The metaphor lacks clarity...
  </div>
</div>
```

**交互方式**：
- 点击评论卡片：左侧滚动到对应位置（根据字符索引）
- 可选：在左侧临时显示简单标记（如背景色闪烁）

#### 优点
✅ **实现简单**：无需复杂的位置同步
✅ **性能好**：左侧编辑器零开销
✅ **清晰直观**：评论和原文在同一卡片中
✅ **无滚动同步问题**：各自独立显示

#### 缺点
❌ 无法在左侧直接看到文本中的问题位置
❌ 需要在评论和编辑器之间切换注意力

#### 实施步骤
1. 移除 `HighlightedTextEditor` 的高亮功能
2. 简化为纯 textarea
3. 在 `SentenceCommentCard` 中显示高亮的 `originalText`
4. 添加点击跳转功能（可选）

---

### 方案3：使用 contentEditable div 替代 textarea

#### 设计思路
使用 `contentEditable` div 替代 textarea，直接在可编辑内容中插入 HTML 高亮标记。

#### 实现细节

```tsx
<div
  className="content-editor"
  contentEditable
  dangerouslySetInnerHTML={{
    __html: renderEditableWithHighlights(content, comments)
  }}
  onInput={handleInput}
/>
```

**高亮渲染**：
```tsx
function renderEditableWithHighlights(content: string, comments: Comment[]) {
  let html = '';
  let lastIndex = 0;

  for (const comment of sortedComments) {
    // 普通文本
    html += escapeHtml(content.slice(lastIndex, comment.startIndex));

    // 高亮文本
    html += `<span class="highlight highlight-${comment.severity}" data-comment-id="${comment.id}">`;
    html += escapeHtml(content.slice(comment.startIndex, comment.endIndex));
    html += '</span>';

    lastIndex = comment.endIndex;
  }

  // 剩余文本
  html += escapeHtml(content.slice(lastIndex));

  return html;
}
```

#### 优点
✅ **高亮精确**：HTML 标记直接嵌入文本
✅ **自动滚动同步**：高亮是文本的一部分
✅ **交互丰富**：可以点击高亮跳转到评论
✅ **视觉效果好**：完全符合 Google Docs 风格

#### 缺点
❌ **实现复杂度极高**：需要处理大量边界情况
❌ **光标管理困难**：contentEditable 的光标位置难以控制
❌ **输入法支持**：中文输入法可能出现问题
❌ **内容同步复杂**：
  - 用户输入时需要重新计算所有评论的位置
  - 插入/删除文本会导致 `start_index`/`end_index` 失效
  - 需要实时更新高亮位置

❌ **状态管理混乱**：
  - 内容既在 `content` state 中，又在 DOM innerHTML 中
  - 需要处理 HTML 转义和反转义
  - 复制粘贴可能带入不需要的格式

❌ **性能问题**：
  - 每次输入都需要重新渲染整个内容
  - 大量评论时渲染开销大

❌ **可访问性差**：contentEditable 的屏幕阅读器支持不如 textarea

#### 实施步骤（如果选择此方案）
1. 创建 `ContentEditableEditor` 组件
2. 实现光标位置保存和恢复
3. 处理输入法兼容性
4. 实现动态索引更新算法（用户编辑时重新计算评论位置）
5. 处理复制粘贴、撤销重做
6. 大量测试和边界情况处理

---

## 对比总结

| 方案 | 实现复杂度 | 用户体验 | 性能 | 可靠性 | 推荐度 |
|------|-----------|---------|------|--------|--------|
| **方案1：分离模式** | ⭐ 低 | ⭐⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 高 | ✅ **强烈推荐** |
| **方案2：评论卡片高亮** | ⭐⭐ 较低 | ⭐⭐⭐ 一般 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 高 | ✅ 推荐 |
| **方案3：contentEditable** | ⭐⭐⭐⭐⭐ 极高 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐ 较差 | ⭐⭐ 低 | ❌ 不推荐 |

## 推荐方案

**首选：方案1（分离编辑和查看模式）**

理由：
1. 符合用户实际使用场景：
   - 编写时专注内容，不需要看到高亮干扰
   - 查看分析时需要清晰看到问题位置

2. 技术实现可靠：
   - 避免了 textarea 的高亮难题
   - 查看模式可以使用标准的 HTML 渲染

3. 性能优秀：
   - 编辑模式零额外开销
   - 查看模式也只是简单的 HTML 渲染

4. 可扩展性好：
   - 未来可以添加版本对比功能
   - 可以支持打印、导出等功能

**备选：方案2（评论卡片高亮）**

适合快速修复，实现简单，用户体验也不错。

**不推荐：方案3（contentEditable）**

除非有强烈的业务需求（如实时协作编辑、富文本编辑器），否则不值得投入如此高的开发和维护成本。

---

## 实施建议

### 短期（立即修复）
采用**方案2**快速修复当前 bug：
1. 移除 `HighlightedTextEditor` 的 overlay 层
2. 简化为纯 textarea
3. 在评论卡片中显示高亮的原文片段

预计工作量：**2-3 小时**

### 中期（功能完善）
实施**方案1**提供完整体验：
1. 保留方案2的简化编辑器
2. 添加"查看版本"功能
3. 创建 `ContentViewer` 组件
4. 实现查看模式的文本高亮

预计工作量：**1-2 天**

### 长期（如有需要）
如果未来有富文本编辑需求，可以考虑引入成熟的编辑器库：
- Slate.js
- ProseMirror
- Quill

不建议自行实现 contentEditable 编辑器。

---

## 相关文件

- `/frontend/src/modules/works/components/review/HighlightedTextEditor.tsx` - 当前有问题的实现
- `/frontend/src/modules/works/components/review/HighlightedTextEditor.css` - 相关样式
- `/frontend/src/modules/works/components/review/ReviewWorkPanel.tsx` - 父组件
- `/frontend/src/modules/works/components/review/CommentCard.tsx` - 评论卡片组件

---

## 更新历史

- 2026-02-13: 初始文档，记录问题和三个改进方案
