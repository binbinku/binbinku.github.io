export const profile = {
  name: '#BK',
  handle: 'binbinku',
  role: '全栈开发工程师',
  title: 'BK · 构建有用的东西',
  description: 'BK 的个人作品空间。探索 GitHub 置顶开源项目、桌面工具和图形开发，也了解作品背后的人。',
  introduction: '我是 BK，一名全栈开发工程师。喜欢把日常遇到的问题做成工具，也把尝试和探索留在开源项目里。',
  github: 'https://github.com/binbinku',
  avatar: 'https://avatars.githubusercontent.com/u/58103137?v=4',
};

export interface ProjectImage { src: string; alt: string }

export interface Project {
  id: string;
  name: string;
  titleLines: string[];
  tagline: string;
  description: string;
  language: string;
  category: string;
  stack: string[];
  url: string;
  image?: string;
  imageAlt?: string;
  gallery?: ProjectImage[];
}

// binbinku GitHub 主页置顶仓库的静态快照，2026-10-29。
// 顺序与 GitHub 置顶顺序一致。资料、介绍与素材来自对应仓库，不在访客浏览时请求 API。
export const projects: Project[] = [
  {
    id: 'project-manager', name: 'BKProjectManager', titleLines: ['Project', 'Manager.'],
    tagline: '项目各归其位，开始更轻松。',
    description: '面向 macOS 与 Windows 11 的本地项目管理器。把分散的项目归集到一个工作空间，浏览代码，运行终端。',
    language: 'JavaScript', category: '开发工具', stack: ['Electron', 'TypeScript', 'macOS / Windows'],
    url: 'https://github.com/binbinku/BKProjectManager',
    image: 'images/projects/project-manager.png', imageAlt: 'BKProjectManager 仓库中的独立工作台截图：目录、代码预览与终端',
    gallery: [
      { src: 'images/projects/project-manager-workspace.png', alt: 'BKProjectManager 仓库中的工作空间截图' },
      { src: 'images/projects/project-manager-category.png', alt: 'BKProjectManager 仓库中的项目分类截图' },
    ],
  },
  {
    id: 'device-monitor', name: 'BKDeviceMonitor', titleLines: ['Device', 'Monitor.'],
    tagline: '让 Android 性能，一目了然。',
    description: '本地运行的 Android 性能监测桌面应用。通过 USB / ADB 观察负载、帧率与硬件信息，留存测试结果。',
    language: 'JavaScript', category: '设备工具', stack: ['Electron', 'Android / ADB', '性能监测'],
    url: 'https://github.com/binbinku/BKDeviceMonitor',
    image: 'images/projects/device-monitor.jpg', imageAlt: 'BKDeviceMonitor 仓库中的性能总览截图：CPU、GPU、内存与趋势',
    gallery: [{ src: 'images/projects/device-monitor-hardware.jpg', alt: 'BKDeviceMonitor 仓库中的设备硬件信息截图' }],
  },
  {
    id: 'app-switch', name: 'BKAppSwitch', titleLines: ['App', 'Switch.'],
    tagline: '你的窗口，随手切换。',
    description: '原生 macOS 菜单栏窗口切换器。按住 Option、按下 Tab，直接跳到想要的窗口。',
    language: 'Swift', category: 'macOS 效率', stack: ['SwiftUI', 'AppKit', 'macOS'],
    url: 'https://github.com/binbinku/BKAppSwitch',
    image: 'images/projects/app-switch.png', imageAlt: 'BKAppSwitch 仓库中的窗口列表演示截图，包含示例数据',
  },
  {
    id: 'clean-helper', name: 'BKCleanHelper', titleLines: ['Clean', 'Helper.'],
    tagline: '一分钟，安心擦一擦。',
    description: '临时暂停键盘、触摸板和外接键鼠输入，60 秒后自动恢复，为 Mac 留出安心清洁的时间。',
    language: 'Swift', category: 'macOS 工具', stack: ['Swift', 'AppKit', 'macOS'],
    url: 'https://github.com/binbinku/BKCleanHelper',
    image: 'images/projects/clean-helper.svg', imageAlt: 'BKCleanHelper 仓库中的清洁模式全屏界面示意图',
  },
  {
    id: 'dx11-template', name: 'DX11Template', titleLines: ['DirectX', 'Eleven.'],
    tagline: '从一个图形开发项目开始。',
    description: 'DX11 项目模板，作为图形开发的起点。',
    language: 'C++', category: '图形开发', stack: ['C++', 'DirectX 11', '项目模板'],
    url: 'https://github.com/binbinku/DX11Template',
  },
  {
    id: 'eft-tools', name: 'BKEFTTools', titleLines: ['EFT', 'Tools.'],
    tagline: '从预设，到模型与纹理。',
    description: '基于 .NET 8 的 EFT 武器预设模型与纹理资源解包工具。',
    language: 'C#', category: '资源工具', stack: ['.NET 8', 'C#', 'AssetStudioCLI'],
    url: 'https://github.com/binbinku/BKEFTTools',
    image: 'images/projects/eft-tools.png', imageAlt: 'BKEFTTools 仓库中的启动界面截图',
    gallery: [
      { src: 'images/projects/eft-tools-items.png', alt: 'BKEFTTools 仓库中的物品数据库界面截图' },
      { src: 'images/projects/eft-tools-preset.png', alt: 'BKEFTTools 仓库中的物品预设界面截图' },
    ],
  },
];

// Cover first; ignore duplicate paths and cap the entire presentation at three images.
export function getProjectImages(project: Project): ProjectImage[] {
  const cover = project.image ? [{ src: project.image, alt: project.imageAlt || project.name }] : [];
  return [...cover, ...(project.gallery || [])]
    .filter((image, index, images) => images.findIndex(item => item.src === image.src) === index)
    .slice(0, 3);
}
