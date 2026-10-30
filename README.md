# BK · 构建有用的东西

以开源项目与个人展示为主的中文网站。Astro + TypeScript，部署到 **https://binbinku.github.io/**。

- `/`：全屏沉浸式作品入口，循环展示六个 GitHub 置顶项目；点击展示区进入主页。
- `/blog/`：三栏内容主页：左侧个人信息，中间依次展示 GitHub 置顶项目与个人项目，右侧最近文章列表。平板采用两栏，手机按个人、项目、文章顺序纵向排列。
- 项目列表底部为“B站视频”，按发布时间展示 B 站公开视频，分批展开，点击到 B 站观看。
- `/videos/`：顶栏“视频”入口的独立 B站视频页面，复用相同资料、粉色卡片和滚动加载；桌面三列、平板两列、手机一列。
- `/opus/`：顶栏“图文”入口的独立 B站图文页面，使用 B 站蓝，展示同一份图文资料并支持滚动加载。
- `/projects/`、`/about/`：项目与个人详细介绍。
- `/projects/<slug>/`：开源项目 README 阅读页，提供源码与原始文档入口。
- `/personal-projects/<slug>/`：个人项目详情，包含完整功能列表与截图。
- `/writing/`：笔记归档；文章详情位于 `/blog/<slug>/`。

## 本地运行

使用 Node.js 24（见 `.nvmrc`）。

```sh
npm ci
npm run dev
```

打开终端显示的 `http://127.0.0.1:4321/`。站点直接部署在域名根目录，本地预览也使用根路径。

```sh
npm run check   # 类型和 Astro 检查
npm run build   # 输出到 dist/
npm test        # 验证构建产物中的链接、图片、草稿和 sitemap
npm run preview
```

## 写文章

在 `src/content/blog/` 新建 `my-note.md`。文件名作为文章 URL，使用英文、数字和短横线。也支持文件夹，例如 `notes/my-note.md`。

```yaml
---
title: '我的笔记'
description: '这篇文章的一句话摘要。'
pubDate: 2026-10-29
tags: ['笔记', '开发']
draft: false
---
```

在 frontmatter 下写 Markdown 正文。二级、三级标题自动生成目录，代码块标记语言即可高亮；文章按日期倒序，自动生成标签归档和相邻文章导航。`draft: true` 不会生成公开页面，也不会出现在文章列表、标签或 sitemap 中。本地也隐藏草稿；写作预览时临时设为 `false`，提交前确认状态。

图片推荐放入 `src/assets/`，在 Markdown 中使用相对路径，例如 `../../assets/workspace.svg`。Astro 会生成适配 `/` 的图片地址。`public/` 中的文件需要在 Markdown 中手动使用 `/images/文件名`。

可在 frontmatter 中添加可选的 `cover: '../../assets/your-cover.jpg'`，为文章设置封面。图片由 Astro 处理并适配部署路径；未设置时使用本站自绘的中性几何封面。

当前包含 8 篇项目介绍，示例文章已删除。项目详情页的“阅读项目介绍”入口在 `src/data/project-articles.ts` 中维护；文章文件名变化时同步更新映射。

## 修改资料和项目

编辑 `src/data/site.ts`，更新昵称、介绍、头像地址和项目列表。个人资料来自 `binbinku` 的公开 GitHub 资料；项目顺序和列表来自 2026-10-29 的 GitHub 主页置顶快照。未来置顶发生变化时，更新此文件及素材即可，网站不在访客浏览时请求 GitHub API。头像使用 GitHub 头像 CDN。没有配置邮箱、简历或其他未提供的资料。

配色和响应式样式位于 `src/styles/global.css`。视觉参考 Vercel / Geist 的黑白与细边界，使用纯色背景，不添加网格、边缘框线或十字装饰。所有页面默认深色，内容页保留深浅色切换；入口固定深色，不改变内容页手动选择的主题。主题偏好使用新版 `bk-theme-v2` 存储键，旧版默认浅色状态不再影响此版本。主页额外使用悬浮圆角毛玻璃顶栏、个人信息和文章面板，背景为低对比度、纯黑白灰的 Canvas 二进制代码雨，`0 / 1` 按列自上而下流动，以雨滴般的速度下落，头部提亮、拖尾渐暗；样式位于 `src/styles/ambient.css`，玻璃使用较低模糊与更高通透度，让后方代码雨仍然可见，不添加网格或十字装饰。减少动态效果时只保留静态暗色数字，页面不可见时暂停绘制，不支持毛玻璃的浏览器使用实色回退。字体使用 Google Fonts 的 Geist / Geist Mono，网络不可用时回退到系统字体。

## AI 使用程度标签

开源项目、个人项目的卡片与详情，以及全屏展示页，统一显示 AI 使用程度。集中编辑 `src/data/ai-usage.ts` 中的 `projectAiUsage`，键为项目路由 ID：`none`（没有使用）、`light`（轻度使用）、`heavy`（重度使用）。未经作者确认的项目使用 `unconfirmed`（待确认），不根据项目语言、代码风格或 README 提及的工具推测。

## 开源项目 README

开源项目卡片进入本站 `/projects/<slug>/` 阅读 README，“查看源码”按钮打开对应 GitHub 仓库。文档快照在 `src/content/project-readmes/`，版本与图片映射在 `src/data/project-readmes.json`；相对图片复制到 `public/images/readmes/`，相对文档链接转换为原仓库地址。README 的目录、表格、代码高亮、图片、键盘标记与折叠问答均可阅读，HTML 经过清理后静态输出。

仓库 README 更新后，使用已登录的 GitHub CLI 在本地执行：

```sh
npm run sync:readmes
npm run check
npm run build
npm test
```

检查并提交更新的文档、图片及来源映射后发布。CI 和访客浏览都使用已保存的快照，不实时请求 GitHub API。README 中引用的第三方徽章仍使用原有图片地址。DX11Template 当前 README 只有项目标题，本站如实展示。

## 个人项目资料

主页中间栏的“个人项目”来自 `binbinku/bkprojectsite` 的 `public/data/proj.json`，固定版本为 `b0f5b2dd0d14c1b2a08e036702112a0d9639cd42`（2026-10-29 整理）。原始数据保存于 `src/data/personal-projects.json`，名称、介绍、功能条目及图片顺序保持原样；路由、技术标签和图片说明在 `src/data/personal-projects.ts` 维护。

包含 Unity 多人射击游戏与自研 C++ 游戏引擎两个项目。卡片链接到本站详情，不将资料仓库当作这些项目的源码地址。八张截图保存于 `public/images/personal-projects/proj_fps/` 与 `proj_engine/`，对应原仓库 `public/images/` 下同名文件。数据与截图随本站静态发布，访客无需请求原站服务。原仓库不作修改，全屏入口仍展示 GitHub 置顶开源项目。

## B站视频

“B站视频”位于个人项目下方，资料来自 UID `172571118`（VincentBK）的公开投稿列表。标题、BV 号、发布时间与时长保存在 `src/data/videos.json`，封面保存在 `public/images/videos/`，访客无需调用 B 站 API 或登录。视频卡片保持黑白灰底色，右下角为粉色 B 站图标和文字；悬浮或键盘聚焦时，边框变粉、封面叠加暗粉色遮罩并显示粉色 B 站图标。点击在新标签页打开对应 B 站视频。

默认显示 6 个，滚动到列表底部自动展开下一批 6 个，保留“加载更多”按钮供键盘操作或不支持自动加载的浏览器使用；全部展开后停止观察底部，不自动抢焦点。关闭 JavaScript 时直接显示全部视频。封面使用延迟加载，不加载播放器或视频文件。暂无自动定时同步；发布新视频后，在本地执行：

```sh
npm run sync:videos
npm run check
npm run build
npm test
```

同步使用公开列表接口的标准 WBI 参数签名，不读取 Cookie、账号密码或私有稿件。逐页核对账号、总数和重复记录；遇到接口验证、限流、数量变化或封面失败时退出，不替换已有清单。CI 使用静态快照，不依赖 B 站接口。

当前已核实收录 30 / 36 个公开视频。部分清单保留真实 `total` 并标记 `complete: false`，页面明确显示收录数量并保留 B 站主页入口；不会将部分清单标为全部。取得完整列表后运行同步，成功时设置 `complete: true`；同步脚本仍要求新清单完整、封面齐全后才替换快照。

也可通过 `npm run sync:videos -- --from /绝对路径/public-videos.json` 导入已取得的完整公开接口数据，格式为 `{ "uid": "172571118", "total": 36, "items": [...] }`。`items` 使用公开投稿的 `bvid`、`title`、`mid`、`created`、`length`、`pic`、`author` 字段；导入时同样校验总数并缓存封面，不保存登录信息。

## 访客统计

博客主页个人信息下方的独立毛玻璃“站点统计”卡片以大号数字突出“累计访客”和“今日访客”，小字展示累计浏览、运行天数、最近更新与作品内容数量。访客和浏览数据来自不蒜子 `busuanzi.cc` 的 `busuanzi_site_uv`、`busuanzi_today_uv`、`busuanzi_site_pv`。从接入后开始累计，无法恢复此前访问量；去重方式和“今日”的日界遵循第三方服务规则，不代表跨设备识别的自然人数，也不将每日人数相加作为累计人数。说明：[服务文档](https://www.busuanzi.cc/doc.php)。

运行天数从首次成功部署日期 2026-10-29 开始，按北京时间完整自然日计算（上线当天为 0 天），前端在跨日或重新打开标签页时自动更新，不依赖重新构建。起点配置在 `src/data/site-dates.ts`，依据首次成功 Pages 工作流 `40831875231`。最近更新读取当前版本的 Git 提交时间，构建时转为北京时间显示；缺少 Git 元数据时显示 `—`，不将重新构建时间伪装成内容更新时间。开源项目、个人项目、公开文章、B站视频与图文数量直接从各自内容源计算，草稿不计入，视频仍如实展示已收录/总数（目前 30/36），点击数量可进入对应列表。

公共布局在所有正常页面接入统计，作品展示页也包含在内，404 不上报。仅正式构建且浏览器域名为 `binbinku.github.io` 时加载第三方脚本；本地开发和本地生产预览均不计数，面板显示 `—` 与“本地预览不计数”。没有后台、数据库或密钥需要配置。统计服务会接收访问 URL、来源和连接信息，访客被服务识别和去重。

数据加载中使用占位符；脚本加载失败或 10 秒仍未取得有效数据时显示“统计暂不可用”，不伪造零值。迟到的有效响应可恢复显示。网络失败、脚本被拦截或未启用 JavaScript 时均不影响正文。测试以模拟响应验证各状态，不调用正式计数接口。统计加载逻辑位于 `src/scripts/visitor-analytics.ts`，更换域名或服务时需同步更新其中的正式域名和脚本地址。

## B站图文

主页和 `/videos/` 的视频区域下方展示“B站图文”，来自同一 UID 的公开图文列表。初次逐页读取 3 页、共 48 篇，以接口返回顺序展示。标题保留原始图文内容，点击打开原 B 站图文；发布日期通过公开详情记录的 `pub_ts` 校验原文 ID 与作者后保存，不从图文 ID 推测。视频和图文卡片统一显示“发布于 YYYY.MM.DD”。

图文与视频共用 `BilibiliGallery.astro`，视频为粉色，图文为 B 站蓝（`#00a1d6`），各自独立计数、滚动加载与按钮展开。两组初始各显示 6 条，每批展开 6 条；无 JavaScript 时全部可见。图文清单位于 `src/data/bilibili-opus.json`，48 张 640 × 360 WebP 封面位于 `public/images/bilibili-opus/`，访客不调用 B 站接口。

手动更新：`npm run sync:opus`，或通过 `npm run sync:opus -- --from /绝对路径/public-opus.json` 导入 `{ "uid": "172571118", "complete": true, "items": [...] }`。同步沿 `offset` 翻页直到 `has_more: false`，检查重复游标、ID 精度、原站链接和封面；缺少日期时读取公开详情，已有已校验的日期与封面可复用缓存。全部成功后才替换清单。之后运行检查、构建和测试再发布。

## 全屏入口与项目素材

入口同样使用二进制代码雨背景。项目卡片在鼠标悬浮或键盘聚焦时压暗封面，并显示居中箭头与“查看项目”提示；触屏设备保留角落箭头。入口仅保留项目展示内容，不显示顶栏、底栏或项目级轮播指示条。图片下方的小圆点显示当前图片位置，也支持点击选择图片。每张图片默认展示 6.5 秒，每个项目最多三张，按配置顺序播完才进入下一个项目；单张素材或几何示意图项目展示一次后继续。键盘左右方向键按同样顺序切换图片，空格键暂停／继续，回车进入主页。键盘聚焦时暂停轮播，另提供仅在键盘聚焦时显示的暂停／播放按钮；页面不可见时暂停计时。系统设置为减少动态效果时默认暂停。关闭 JavaScript 后仍显示第一个项目并可正常进入主页。

`src/data/site.ts` 中的 `image` 是项目封面，`gallery` 可追加图片（包含 `src`、`alt`）。展示页以封面为第一张，去重后最多取三张；项目卡片也循环播放已有图片，个人项目卡片使用完整截图列表。每 4.5 秒切换，底部小圆点提示位置；悬浮、键盘聚焦、离开视口或页面不可见时暂停，减少动态效果时保留静态封面。

项目素材保存于 `public/images/projects/`，均来自用户自己的对应公开仓库，来源如下：

| 本地文件 | 来源仓库路径 |
| --- | --- |
| `project-manager.png` | `binbinku/BKProjectManager` → `docs/assets/workbench-dark.png` |
| `project-manager-workspace.png` | `binbinku/BKProjectManager` → `docs/assets/workspace-dark.png` |
| `project-manager-category.png` | `binbinku/BKProjectManager` → `docs/assets/category-dark.png` |
| `device-monitor-hardware.jpg` | `binbinku/BKDeviceMonitor` → `docs/screenshots/hardware.jpg` |
| `device-monitor.jpg` | `binbinku/BKDeviceMonitor` → `docs/screenshots/overview.jpg` |
| `app-switch.png` | `binbinku/BKAppSwitch` → `docs/images/window-switcher.png` |
| `clean-helper.svg` | `binbinku/BKCleanHelper` → `docs/images/overlay.svg` |
| `eft-tools-items.png` | `binbinku/BKEFTTools` → `Data/ItemDB.png` |
| `eft-tools-preset.png` | `binbinku/BKEFTTools` → `Data/ItemPreset.png` |
| `eft-tools.png` | `binbinku/BKEFTTools` → `Data/Start.png` |

DX11Template 没有项目截图，使用本站绘制并明确标注的几何示意图。BKCleanHelper 素材本身是仓库的界面示意图；BKAppSwitch 素材使用仓库提供的演示数据。图片不依赖第三方图床或运行时 API。

## 首次部署

1. 确保 GitHub CLI 登录到 `binbinku`，具备创建仓库、推送工作流和管理 Pages 的权限：`gh auth login --hostname github.com`，然后 `gh auth status`。
2. 如尚未初始化 Git：`git init -b main`，随后 `git add .` 和 `git commit -m "Build BK personal website"`。
3. 若 `binbinku/binbinku.github.io` 尚不存在：`gh repo create binbinku/binbinku.github.io --public --source=. --remote=origin --push`。若仓库已存在，先检查其内容，确认安全后再关联和推送；不要覆盖已有历史。
4. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。也可使用有管理权限的 CLI：

```sh
gh api --method POST repos/binbinku/binbinku.github.io/pages -f build_type=workflow
```

5. 如果首次推送早于 Pages 启用，手动运行 `gh workflow run deploy.yml --repo binbinku/binbinku.github.io`。
6. 在 Actions 中确认构建和部署成功，访问线上首页与任一文章，再提交一次内容修改验证自动更新。

后续提交并推送 `main` 即会自动检查、构建和部署。检查或构建失败不会替换已发布版本。紧急回退可以撤销有问题的提交后推送，重新触发部署。

主域名和根路径 `base: '/'` 在 `astro.config.mjs` 中配置；站内链接使用统一路径函数。若迁移仓库或域名，需同步修改这两项。当前未配置自定义域名、评论、搜索、RSS 或后台。

## 页面

全屏入口、内容主页、笔记列表、文章详情、标签归档、项目、关于、404 和 sitemap 均为静态文件，无需服务器、数据库或运行时密钥。GitHub Pages 的 `404.html` 为真实错误页，不采用 SPA 重写。
