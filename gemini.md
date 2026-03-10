# 项目经验沉淀 (AI Assistant Memory)

- Updated: 2026-03-09
- Project: Organic Editorial - Personal Homepage
- Primary Goal: 托管在 GitHub Pages 上的精美个人主页，追求极致的设计哲学与动画交互。

## 1. 核心设计哲学 (Design Philosophy)

在启动项目前，我们严格执行了 `brainstorming` 规则，确定了三种视觉方向，并最终选择了 **"Organic Editorial" (有机电子杂志)** 风格：

- **美学规避**：抛弃典型的“AI 面条式设计”（如无聊的白背景紫渐变、标准圆角卡片、平庸的居中对齐、默认粗细的 Inter 字体）。
- **材质模拟**：全局覆写 `#F7F5F0` 羊皮纸白背景，辅以极弱（透明度 0.04）的 SVG 噪点贴图（`Noise Overlay`），赋予屏幕一种接近纸张的呼吸感和胶片感。
- **排版张力**：大量留白与极致的尺寸反差。标题使用超大号优雅衬线体 (`Playfair Display`)，正文使用极简无衬线体 (`Plus Jakarta Sans`)。

## 2. 动效实现踩坑与最佳实践 (Framer Motion)

本项目放弃了沉重的 3D 库，转而在 React 中利用 `framer-motion` 与局部 Vanilla CSS 实现原生丝滑的浏览器交互：

### 实践经验 1：Scroll Parallax & Transfrom

- **场景**：在书影音板块，我们需要在鼠标向下滚动时，将内容横向推送出去。
- **解法**：不依赖外部复杂的滚动劫持库。利用 Framer Motion 的 `useScroll({ target: targetRef })` 拿到纵向滚动进度 `scrollYProgress`，再利用 `useTransform(scrollYProgress, [0, 1], ["0%", "-75%"])` 控制目标容器的水平 `x` 轴位移。极其丝滑且对性能友好。

### 实践经验 2：动效排队与类型校验

- **踩坑点**：在使用独立提炼的 `variants` 变量定义（如 `wordVariants`）时，若不显式声明类型，由于当前 Vite 项目启用了 `verbatimModuleSyntax` 和强校验，`TypeScript` 会抛出无法推断 `IntrinsicAttributes & HTMLMotionProps` 的错误。
- **修复**：必须从 `framer-motion` 中引入 `type Variants`，并在声明时赋型：`const wordVariants: Variants = { ... }`，这一习惯应在后续项目中形成肌肉记忆。

### 实践经验 3：原生混合模式 (Mix Blend Mode)

- **场景**：Hero 页面有一个浮动在所有彩色内容和图片上的大标题文字。
- **解法**：通过赋予 `mix-blend-mode: exclusion; color: white;`，让这段文字能够根据底层元素的颜色智能反转高宽，产生一种高级的时尚杂志封面错觉。

### **实践经验 4：全局顺滑滚动 (Lenis Smooth Scroll) 的冲突与清理**

- **场景**：在 React 中引入 `@studio-freight/lenis` 实现全局缓动滚动时，遇到滚轮完全失灵的问题。
- **踩坑点 1 (CSS 冲突)**：切忌在 CSS 或 JS 中全局（尤其是 `html/body`）设置 `scroll-behavior: smooth;`，原生平滑滚动会与 Lenis 的虚拟滚动计算产生致命冲突，导致页面卡死或滚动异常。
- **踩坑点 2 (RAF 内存泄漏)**：如果在 `useEffect` 中手写了 `requestAnimationFrame` 来驱动 `lenis.raf()`，在组件卸载时不仅要 `lenis.destroy()`，**必须**同步执行 `cancelAnimationFrame` 清除动画帧 ID，否则会导致严重的事件循环叠加。

### 实践经验 5：Framer Motion 路由页面切换过渡 (AnimatePresence)

- **场景**：在 React Router 跳转页面时，希望实现丝滑的淡入淡出与轻微的上升入场动画。
- **解法**：必须将原本包裹在 `<BrowserRouter>` 下的 `<Routes>` 抽离为一个独立的子组件（如 `AnimatedRoutes.tsx`），以便在该子组件内部使用 `useLocation()` 拿到具体的路由对象作为 `<AnimatePresence mode="wait">` 和 `<Routes key={location.pathname}>` 的强追踪判定。
- **关联踩坑**：在应用了 Lenis 全局滚动的场景下，页面跳转默认不会回到顶部。必须在自定义的 `LenisProvider` 中添加 `useLocation` 监听，并在路由变化时调用 `lenisInstance.scrollTo(0, { immediate: true })` 强制重置滚动条位置，否则下一个过渡页面的 y 轴位置会错乱。

## 3. GitHub Pages 部署兼容

当前项目架构为 **Vite + React (完全无后端 API)**，极其适合部署为静态页面：

- 执行 `npm run build` 后，所有的输出会被打包到 `dist/`。
- 我们利用手写的 CSS Modules，完全杜绝了全局样式冲突的可能。
- 随后只需基于 GitHub Actions 自动化部署 `dist` 目录到 `gh-pages` 分支，即可实现极简的上线工作流。

## 4. Admin OS 后台管理 & 元数据刮削 API 源（已验证）

后台管理系统位于 `scripts/admin-server.js`，通过密码保护（默认 `2young2simple`，可通过环境变量 `ADMIN_PASSWORD` 修改）。所有 API URL 使用 `127.0.0.1:3001` 而非 `localhost`，避免 Windows IPv6 解析问题。

### 电影 API

| 源 | 端点 | Key | 注意 |
|---|---|---|---|
| **TMDB** | `api.themoviedb.org/3/search/movie` | `2dca580c2a14b55200e784d157207b4d` | **中国电影首选**，支持 `language=zh-CN`，可搜电影+电视剧 |
| OMDb | `omdbapi.com/?s=` | `4a3b711b` | IMDb 镜像，英文电影覆盖广 |
| iTunes | `itunes.apple.com/search?media=movie` | 无需 | 同音乐的区域限制问题 |
| TVMaze | `api.tvmaze.com/search/shows` | 无需 | 欧美电视剧为主 |
| Jikan | `api.jikan.moe/v4/anime` | 无需 | MyAnimeList 的 API，日漫专用 |

### 通用工程经验

- 所有外部 fetch 统一用 `fetchSafe()` 包装（6 秒超时 + 返回 `null` 而非 throw），防止单个 API 挂掉拖垮整个搜索。
- `fs` 模块：ESM 项目中不能用 `import fs from 'fs/promises'` 然后调 `fs.existsSync()`，必须 `import fs from 'fs'` + `const fsp = fs.promises`。
- 全局 UI 禁止使用 emoji 和原生 `alert/confirm` 弹窗，统一使用自定义 Toast 和 ConfirmDialog 组件。

## 5. 后续建议

后续若需拓展博客，无需重构 React 页面，只需在项目中引入 `unified` / `remark` 体系解析本地 Markdown 文件并渲染，即可维持极其清爽的文件管理体验。
