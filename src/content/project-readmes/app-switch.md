---
projectId: "app-switch"
sourceUrl: "https://github.com/binbinku/BKAppSwitch/blob/47126110791fa174e806c0887ee0fdd94d635ad0/README.md"
syncedAt: "2026-10-29"
---
<div align="center">

<img src="docs/images/banner.zh.svg" alt="BKAppSwitch — 按住 ⌥ 按下 Tab，窗口随手切换" width="100%">

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-4DDBBD?style=flat-square"></a>
  <img alt="macOS 13+" src="https://img.shields.io/badge/macOS-13%2B-1A3340?style=flat-square&logo=apple&logoColor=white">
  <img alt="Swift 5.9+" src="https://img.shields.io/badge/Swift-5.9%2B-F05138?style=flat-square&logo=swift&logoColor=white">
  <img alt="零依赖" src="https://img.shields.io/badge/依赖-0-3D8A8C?style=flat-square">
</p>

**简体中文** · [English](README.en.md)

[✨ 功能](#-功能特性) · [🚀 快速开始](#-快速开始) · [⚡ 快捷键](#-快捷键) · [❓ 常见问题](#-常见问题) · [🤝 参与贡献](#-参与贡献)

</div>

---

## 👋 简介

**BKAppSwitch** 是一个开源的 macOS 菜单栏窗口切换器。

开着好几个 VS Code 项目，还要在浏览器和终端之间来回跳？macOS 自带的 `⌘ Tab` 只能按应用切换。BKAppSwitch 把你选中的应用的**所有窗口**放进同一个列表，按住 `⌥`、按下 `Tab`，就能直接跳到要找的那个窗口。

- 🪶 原生 Swift + SwiftUI + AppKit，**无第三方依赖**
- 🔒 **无网络请求**，不读项目文件，无需账号
- 📄 采用 [MIT 许可证](LICENSE)，可自由使用、修改和分发

## 📸 界面预览

<div align="center">
  <img src="docs/images/window-switcher.png" alt="BKAppSwitch 窗口切换列表：显示应用图标、窗口标题、选中状态和最小化标记" width="560">
</div>

<sub>同一个列表里显示不同应用的窗口。高亮行是当前选择；VS Code 窗口突出项目名，同时保留原始标题；最小化的窗口带有标记。截图使用内置演示数据，不包含真实工作内容。</sub>

## 🎯 三步切换

<div align="center">
  <img src="docs/images/how-it-works.zh.svg" alt="按住 Option，按 Tab 选择，松开 Option 切换到窗口" width="100%">
</div>

## ✨ 功能特性

| | 功能 | 说明 |
| :-: | --- | --- |
| 🧩 | **自选参与切换的应用** | 默认包含 VS Code，也可添加任意 `.app`；支持临时停用和移除 |
| 🪟 | **按窗口切换** | 直接选中某个项目或窗口，显示对应应用的真实图标 |
| 📌 | **固定列表顺序** | 运行期间已有窗口保持相对位置，新窗口追加到末尾，不会越用越乱 |
| ⌨️ | **键盘鼠标都能用** | 反向选择、方向键、松开 ⌥ 确认、Esc 取消、点击跳转 |
| 🔽 | **恢复最小化窗口** | 选中后自动恢复并激活 |
| 🖥️ | **发现其他桌面的窗口** | 结合辅助功能接口和应用原生“窗口”菜单补充窗口信息 |
| 🏷️ | **VS Code 项目名识别** | 从窗口标题中提取项目名，识别方式可调 |
| 🔒 | **纯本地运行** | 不读取文件内容，不发送窗口标题，无需账号 |

## 💻 系统要求

| 项目 | 要求 |
| --- | --- |
| 🍎 操作系统 | macOS 13 Ventura 或更新版本 |
| 📦 安装镜像 | 打包脚本生成 Apple 芯片（arm64）版本；Intel Mac 请从源码构建验证 |
| 🛠️ 源码构建 | Xcode 或 Command Line Tools，包含 Swift 5.9+ |
| ✅ 需要的权限 | 辅助功能（用于读取和切换窗口） |
| 🚫 不需要的权限 | 输入监控、屏幕录制 |

## 🚀 快速开始

### 方式一：从源码构建（推荐）

打开“终端”，依次执行：

```sh
git clone https://github.com/binbinku/AppSwitch.git
cd AppSwitch
zsh scripts/build-app.sh
zsh scripts/install-app.sh
open /Applications/BKAppSwitch.app --args --settings
```

构建结果为 `dist/BKAppSwitch.app`，安装脚本会把它复制到 `/Applications/BKAppSwitch.app`。如果没有编译工具，先运行 `xcode-select --install`，按系统提示完成安装。

> [!TIP]
> 建议安装到“应用程序”后再授权，并且始终使用这一份。构建和安装脚本不会覆盖正在运行的 BKAppSwitch，升级前请先从菜单栏退出。

### 方式二：安装 DMG

如果 [Releases](https://github.com/binbinku/AppSwitch/releases) 里有安装镜像，可以直接下载，无需安装开发工具：

1. 下载适合你设备的 `.dmg` 文件。
2. 打开镜像，把 **BKAppSwitch** 拖到 **Applications（应用程序）**。
3. 推出镜像，从“应用程序”启动 BKAppSwitch。
4. 按下一节完成辅助功能授权。

> [!NOTE]
> 当前镜像仅适用于 Apple 芯片 Mac，使用本地临时签名，**未经过 Apple 公证**。首次打开如果被系统阻止，请确认来源可信后，在“系统设置 → 隐私与安全性”中按提示允许打开。

### 🔑 首次使用：授权并选择应用

1. BKAppSwitch 启动后常驻**屏幕顶部菜单栏**，没有 Dock 图标。点击菜单栏的叠放窗口图标，打开“**设置与权限…**”。
2. 点击“**授权辅助功能**”，前往“系统设置 → 隐私与安全性 → 辅助功能”。
3. 添加并启用 `/Applications/BKAppSwitch.app`，必要时退出 BKAppSwitch 再重新打开。以设置页显示“**辅助功能：已授权**”为准。
4. 在“**参与切换的应用**”中保留 VS Code，或点击“**添加应用…**”选择其他应用，确保对应开关已打开。
5. 打开这些应用的窗口，按住 `⌥`，按 `Tab`，开始切换 🎉

添加应用不会自动启动它。列表只显示已启用、正在运行且能提供窗口信息的应用；移除应用也不会关闭它的窗口。

## ⚡ 快捷键

以下是默认快捷键（Option 键也写作 `⌥` 或 `Alt`）：

| 操作 | 效果 |
| --- | --- |
| 按住 `⌥`，按 `Tab` | 打开列表，选中下一个窗口 |
| 保持 `⌥`，继续按 `Tab` | 向后循环选择 |
| `⌥` `⇧ Shift` `Tab` | 反向选择 |
| 松开 `⌥` / 按 `Return` | 确认并切换 |
| `↑` `↓` 方向键 | 在列表中移动 |
| `Esc` / 点击列表外 / 点击关闭按钮 | 取消 |
| 点击某一行 | 立即跳转到该窗口 |

也可以从菜单栏点击“**显示窗口列表**”，让列表保持打开，再点击目标窗口或按 Return 确认。

唤起快捷键可以在设置中改为 `⌃ ⌥ Tab` 或 `⌥ Space`。无论选哪一种，松开 `⌥` 都会确认，加上 Shift 则反向选择。

### 📌 为什么列表不按使用频率重排？

固定位置更容易记住目标窗口在哪儿。已有窗口在本次运行中保持相对顺序；新窗口排到末尾，关闭的窗口移出列表。最近使用记录只决定**初始选中项**（方便切回上一个窗口），不会改变各行的位置。BKAppSwitch 重启后会重新建立顺序。

### 🏷️ 让 VS Code 项目名更清楚

BKAppSwitch 会尝试从 VS Code 标题中识别项目名。如果你用了自定义标题，可以在设置中选择“**项目名在前**”“**文件名在前**”或“**完整原始标题**”。

推荐在 VS Code 的**用户级** `settings.json` 中加入以下设置，再把 BKAppSwitch 的识别方式改为“项目名在前”：

```json
{
  "window.title": "${rootName}${separator}${activeEditorShort}"
}
```

自动识别是启发式判断，完整原始标题始终保留。同名项目可以用 `${rootPath}` 或不同的 `.code-workspace` 文件名区分。标题识别只对 VS Code 系列生效，其他应用显示完整窗口标题。BKAppSwitch 不会修改 VS Code 设置，也不需要安装扩展。

## ❓ 常见问题

<details>
<summary><b>启动后找不到窗口，也没有 Dock 图标？</b></summary>

<br>

这是菜单栏应用，正常运行时没有 Dock 图标。请点击屏幕顶部的叠放窗口图标，选择“设置与权限…”，或者运行：

```sh
open /Applications/BKAppSwitch.app --args --settings
```

</details>

<details>
<summary><b>系统里权限已经打开，BKAppSwitch 仍显示未授权？</b></summary>

<br>

本地临时签名在重新编译或升级后可能变化，系统保留的旧授权不一定对新版本生效：

1. 从菜单栏退出 BKAppSwitch，确认新版本已安装到固定位置。
2. 在“辅助功能”列表中移除旧的 BKAppSwitch 条目。
3. 重新添加 `/Applications/BKAppSwitch.app` 并开启权限，再从该路径启动。
4. 在 BKAppSwitch 设置页核对“当前运行的应用”路径和授权状态。

不要同时运行 `dist` 和“应用程序”里的两份 BKAppSwitch。

</details>

<details>
<summary><b>按快捷键没有反应？</b></summary>

<br>

先从菜单栏点击“显示窗口列表”。如果列表能打开，到设置中查看“系统热键”是否注册成功，换一个组合后点击“重新检查”。热键可能被其他软件占用，设置页会显示系统错误码和最近一次触发时间。唤起热键本身不依赖辅助功能权限，但读取和切换窗口需要。

</details>

<details>
<summary><b>列表是空的，或者某个应用的窗口没有出现？</b></summary>

<br>

检查该应用是否已添加、已启用、正在运行并打开了窗口，以及 BKAppSwitch 是否已获得辅助功能授权。目标应用需要通过 macOS 辅助功能或原生“窗口”菜单提供可识别的窗口信息，所以不同应用的兼容性会有差异。

</details>

<details>
<summary><b>能切换到其他桌面或全屏窗口吗？</b></summary>

<br>

BKAppSwitch 会结合辅助功能窗口和原生“窗口”菜单发现目标，并通过目标应用提供的接口跳转，不使用私有 Space API。不同应用、全屏和多显示器环境下的效果需要实际验证。

如果没有自动切换桌面，可以检查“系统设置 → 桌面与程序坞 → 调度中心”里的“切换到某个应用程序时，切换到包含该应用程序的打开窗口的空间”。

</details>

<details>
<summary><b>会影响原来的 CodeSwitch 吗？</b></summary>

<br>

不会。BKAppSwitch 使用独立的名称和 Bundle ID（`dev.appswitch.app`），安装到 `/Applications/BKAppSwitch.app`，不会替换 CodeSwitch，也不会迁移它的偏好设置。首次使用需要单独授权并配置应用列表。如果两者同时运行，请给它们设置不同的快捷键；也可以先用 BKAppSwitch 的演示模式看看界面。

</details>

<details>
<summary><b>支持开机启动吗？怎么卸载？</b></summary>

<br>

目前没有内置开机启动开关，可以在“系统设置 → 通用 → 登录项”中手动添加 BKAppSwitch。

卸载时先从菜单栏退出，再把 BKAppSwitch.app 移到废纸篓；也可以顺手在“辅助功能”和“登录项”里移除对应条目。

</details>

## 🔒 隐私与权限

- 🛡️ **辅助功能**用于读取窗口标题、识别窗口和激活所选窗口，由你手动授权。
- 📴 应用**没有任何网络请求**，不上传窗口标题，不读取项目文件内容。
- 💾 应用列表、快捷键和标题识别方式保存在本机偏好设置中。
- 🙅 不需要输入监控或屏幕录制权限。
- 🩺 诊断文件只在显式传入参数时写入，内容为状态、计数和运行路径，不包含窗口标题或文件内容。

## 🛠️ 开发

### 测试与构建

```sh
swift test
zsh scripts/build-app.sh
```

核心逻辑测试覆盖固定窗口顺序、最近窗口选择、菜单重建、应用列表持久化、标题识别、双向循环，以及加载期间的快速按键和取消。系统授权、跨桌面、全屏和多显示器行为仍需实机验证。

### 🎭 演示模式

不授权也可以预览界面：

```sh
open -n dist/BKAppSwitch.app --args --demo
```

演示模式使用示例数据，不注册系统热键，也不会切换真实窗口。正常模式下，设置页同样提供“界面预览”入口。

### 🩺 诊断

排查问题时可以显式指定诊断文件路径：

```sh
open dist/BKAppSwitch.app --args --diagnostic-file /tmp/appswitch-status.json
```

### 📦 打包与签名

```sh
zsh scripts/package-release.sh
```

会生成 `dist/BKAppSwitch-<版本号>-macOS-arm64.dmg` 和对应的 `.sha256` 校验文件，镜像包含应用、Applications 快捷方式和中文安装说明。打包在独立目录中完成；如果已有同名发布文件，脚本会停止，避免覆盖。

本机构建默认使用临时签名。如果有 Apple Developer 签名身份，可以这样指定：

```sh
APPSWITCH_SIGN_IDENTITY='Developer ID Application: Your Name (TEAMID)' zsh scripts/build-app.sh
```

公开分发应完成 Developer ID 签名和 Apple 公证；当前脚本还没有自动公证流程。

### 🗂️ 代码结构

```text
AppSwitch/
├── Sources/
│   ├── BKAppSwitch/          # 菜单栏入口、设置界面、窗口列表、热键、辅助功能交互
│   └── AppSwitchCore/      # 标题识别、应用选择、固定排序、切换状态（可独立测试）
├── Tests/
│   └── AppSwitchCoreTests/ # 核心逻辑单元测试
├── Resources/              # Info.plist、图标生成脚本、安装说明
├── scripts/                # 构建、安装、运行状态检查、DMG 打包
└── docs/images/            # README 图片
```

## 🤝 参与贡献

欢迎各种形式的贡献 💚

- 🐛 **反馈问题**：在 [Issues](https://github.com/binbinku/AppSwitch/issues) 中描述问题。涉及窗口兼容性时，请附上 macOS 版本、芯片类型、BKAppSwitch 版本、目标应用及其版本、复现步骤，以及是否涉及全屏或多个桌面。
- 💡 **提出建议**：同样欢迎在 Issues 中讨论新想法。
- 🔧 **提交代码**：发起 [Pull Request](https://github.com/binbinku/AppSwitch/pulls) 前请运行 `swift test` 和构建脚本；涉及窗口交互的改动，请说明已经验证过的应用和场景。

> [!WARNING]
> 提交截图和诊断信息前，请先检查并移除其中的私人内容。

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源 © 2026 [binbinku](https://github.com/binbinku)。

你可以自由使用、修改和分发本项目，只需保留许可证中的版权及许可声明。

<div align="center">
  <br>
  <img src="docs/images/logo.svg" alt="BKAppSwitch" width="64">
  <br>
  <sub>如果 BKAppSwitch 对你有帮助，欢迎点一个 ⭐️</sub>
</div>
