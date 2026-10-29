# BK · 构建有用的东西

以开源项目与个人展示为主的中文网站。Astro + TypeScript，部署到 **https://binbinku.github.io/**。

- `/`：全屏沉浸式作品入口，循环展示六个 GitHub 置顶项目；点击展示区进入主页。
- `/blog/`：三栏内容主页：左侧个人信息，中间依次展示 GitHub 置顶项目与个人项目，右侧最近文章列表。平板采用两栏，手机按个人、项目、文章顺序纵向排列。
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

初始 `hello-world.md` 是明确标注的示例文章，可直接修改或删除。

## 修改资料和项目

编辑 `src/data/site.ts`，更新昵称、介绍、头像地址和项目列表。个人资料来自 `binbinku` 的公开 GitHub 资料；项目顺序和列表来自 2026-10-29 的 GitHub 主页置顶快照。未来置顶发生变化时，更新此文件及素材即可，网站不在访客浏览时请求 GitHub API。头像使用 GitHub 头像 CDN。没有配置邮箱、简历或其他未提供的资料。

配色和响应式样式位于 `src/styles/global.css`。视觉参考 Vercel / Geist 的黑白与细边界，使用纯色背景，不添加网格、边缘框线或十字装饰。所有页面默认深色，内容页保留深浅色切换；入口固定深色，不改变内容页手动选择的主题。主题偏好使用新版 `bk-theme-v2` 存储键，旧版默认浅色状态不再影响此版本。字体使用 Google Fonts 的 Geist / Geist Mono，网络不可用时回退到系统字体。

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

## 全屏入口与项目素材

入口仅保留项目展示内容，不显示顶栏、底栏或项目级轮播指示条。图片下方的小圆点显示当前图片位置，也支持点击选择图片。每张图片默认展示 6.5 秒，每个项目最多三张，按配置顺序播完才进入下一个项目；单张素材或几何示意图项目展示一次后继续。键盘左右方向键按同样顺序切换图片，空格键暂停／继续，回车进入主页。键盘聚焦时暂停轮播，另提供仅在键盘聚焦时显示的暂停／播放按钮；页面不可见时暂停计时。系统设置为减少动态效果时默认暂停。关闭 JavaScript 后仍显示第一个项目并可正常进入主页。

`src/data/site.ts` 中的 `image` 是项目封面，`gallery` 可追加图片（包含 `src`、`alt`）。展示页以封面为第一张，去重后最多取三张；主页项目卡片仍使用封面。

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
