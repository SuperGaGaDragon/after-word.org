  1. Review UI 模块 (最大收益)                                                              
                                         
  这些组件只在查看/编辑作品时用到，不需要在首页/工作区就加载：                              
                                                                                            
  frontend/src/modules/works/components/review/                                             
  ├── ReviewWorkPanel.tsx          (~245 lines)                                             
  ├── HighlightedTextEditor.tsx    (~140 lines)
  ├── CommentsSidebar.tsx          (~85 lines)
  ├── CommentCard.tsx              (~200+ lines, 3个组件)
  ├── ReviewWorkPanel.css          (~447 lines)
  ├── HighlightedTextEditor.css
  ├── CommentsSidebar.css
  └── CommentCard.css

  收益: 这部分代码可能占 40-50KB，只在用户点开作品详情时才加载。

  2. Radix UI 组件库

  如果使用了 Radix UI 的组件（AlertDialog, DropdownMenu 等），这些也可以按需加载：
  - @radix-ui/react-alert-dialog
  - @radix-ui/react-dropdown-menu

  3. 路由级别的分割

  可以对整个页面做懒加载：
  - WorkDetailPage（包含所有 Review UI）
  - WorkspacePage
  - AccountPage

  具体实现方式

  使用 React 的 lazy 和 Suspense：

  // 当前：直接导入
  import { ReviewWorkPanel } from './review/ReviewWorkPanel';

  // 优化后：懒加载
  const ReviewWorkPanel = lazy(() => import('./review/ReviewWorkPanel'));

  // 使用时包裹 Suspense
  <Suspense fallback={<div>Loading...</div>}>
    <ReviewWorkPanel {...props} />
  </Suspense>

  我的建议

  最简单有效的方案：
  1. 把整个 WorkDetailPage 做懒加载（包含所有 Review UI）
  2. 把 WorkspacePage 也做懒加载
