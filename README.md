# BK · 构建有用的东西

以开源项目与个人展示为主的中文网站。Astro + TypeScript，部署到 **https://binbinku.github.io/BKSite/**。

- `/BKSite/`：全屏沉浸式作品入口，循环展示六个 GitHub 置顶项目；点击展示区进入主页。
- `/BKSite/blog/`：内容主页，重点展示项目和个人介绍，底部保留少量笔记入口。
- `/BKSite/projects/`、`/BKSite/about/`：项目与个人详细介绍。
- `/BKSite/writing/`：笔记归档；既有文章仍使用 `/BKSite/blog/<slug>/`，原有文章链接不变。

## 本地运行

使用 Node.js 24（见 `.nvmrc`）。

```sh
npm ci
npm run dev
```

打开终端显示的 `http://127.0.0.1:4321/BKSite/`。站点使用 `/BKSite/` 前缀，本地预览也需要该前缀。

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

图片推荐放入 `src/assets/`，在 Markdown 中使用相对路径，例如 `../../assets/workspace.svg`。Astro 会生成适配 `/BKSite/` 的图片地址。`public/` 中的文件需要在 Markdown 中手动使用 `/BKSite/images/文件名`。

可在 frontmatter 中添加可选的 `cover: '../../assets/your-cover.jpg'`，为文章设置封面。图片由 Astro 处理并适配部署路径；未设置时使用本站自绘的中性几何封面。

初始 `hello-world.md` 是明确标注的示例文章，可直接修改或删除。

## 修改资料和项目

编辑 `src/data/site.ts`，更新昵称、介绍、头像地址和项目列表。个人资料来自 `binbinku` 的公开 GitHub 资料；项目顺序和列表来自 2026-10-29 的 GitHub 主页置顶快照。未来置顶发生变化时，更新此文件及素材即可，网站不在访客浏览时请求 GitHub API。头像使用 GitHub 头像 CDN。没有配置邮箱、简历或其他未提供的资料。

配色和响应式样式位于 `src/styles/global.css`。视觉参考 Vercel / Geist 的黑白、网格与细边界。所有页面默认深色，内容页保留深浅色切换；入口固定深色，不改变内容页手动选择的主题。主题偏好使用新版 `bk-theme-v2` 存储键，旧版默认浅色状态不再影响此版本。字体使用 Google Fonts 的 Geist / Geist Mono，网络不可用时回退到系统字体。

## 全屏入口与项目素材

入口默认每 6.5 秒切换一次，支持六个项目选择按钮、上一项／下一项、暂停／播放和键盘左右方向键。键盘聚焦控件时暂停轮播，可用播放按钮恢复；页面不可见时暂停计时。系统设置为减少动态效果时默认暂停。关闭 JavaScript 后仍显示第一个项目并可正常进入主页。

项目素材保存于 `public/images/projects/`，均来自用户自己的对应公开仓库，来源如下：

| 本地文件 | 来源仓库路径 |
| --- | --- |
| `project-manager.png` | `binbinku/BKProjectManager` → `docs/assets/workbench-dark.png` |
| `device-monitor.jpg` | `binbinku/BKDeviceMonitor` → `docs/screenshots/overview.jpg` |
| `app-switch.png` | `binbinku/BKAppSwitch` → `docs/images/window-switcher.png` |
| `clean-helper.svg` | `binbinku/BKCleanHelper` → `docs/images/overlay.svg` |
| `eft-tools.png` | `binbinku/BKEFTTools` → `Data/Start.png` |

DX11Template 没有项目截图，使用本站绘制并明确标注的几何示意图。BKCleanHelper 素材本身是仓库的界面示意图；BKAppSwitch 素材使用仓库提供的演示数据。图片不依赖第三方图床或运行时 API。

## 首次部署

1. 确保 GitHub CLI 登录到 `binbinku`，具备创建仓库、推送工作流和管理 Pages 的权限：`gh auth login --hostname github.com`，然后 `gh auth status`。
2. 如尚未初始化 Git：`git init -b main`，随后 `git add .` 和 `git commit -m "Build BK personal website"`。
3. 若 `binbinku/BKSite` 尚不存在：`gh repo create binbinku/BKSite --public --source=. --remote=origin --push`。若仓库已存在，先检查其内容，确认安全后再关联和推送；不要覆盖已有历史。
4. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。也可使用有管理权限的 CLI：

```sh
gh api --method POST repos/binbinku/BKSite/pages -f build_type=workflow
```

5. 如果首次推送早于 Pages 启用，手动运行 `gh workflow run deploy.yml --repo binbinku/BKSite`。
6. 在 Actions 中确认构建和部署成功，访问线上首页与任一文章，再提交一次内容修改验证自动更新。

后续提交并推送 `main` 即会自动检查、构建和部署。检查或构建失败不会替换已发布版本。紧急回退可以撤销有问题的提交后推送，重新触发部署。

默认主域名和 `/BKSite` 前缀在 `astro.config.mjs` 中配置；站内链接使用统一路径函数。若迁移仓库或域名，需同步修改这两项。当前未配置自定义域名、评论、搜索、RSS 或后台。

## 页面

全屏入口、内容主页、笔记列表、文章详情、标签归档、项目、关于、404 和 sitemap 均为静态文件，无需服务器、数据库或运行时密钥。GitHub Pages 的 `404.html` 为真实错误页，不采用 SPA 重写。
