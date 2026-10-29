---
title: 'DX11Template：沿着一帧画面理解 DirectX 11'
description: '从 Win32 窗口到 DrawIndexed，一个包含网格、相机与着色器的 C++ 图形开发起点。'
pubDate: 2026-10-29
tags: ['项目介绍', 'C++', '图形开发']
draft: false
---

在引擎里看到一个模型时，窗口、显卡设备、顶点数据和着色器已经被框架接好了。DX11Template 把这条链路展开成一个较小的 C++ 工程，方便从初始化到每帧绘制逐步阅读。

仓库 README 目前只有项目标题，本文的实现介绍来自对应版本的 `Base/Main.cpp` 与 `Base/Core/` 源码。

## 从 Win32 窗口开始

入口先注册窗口类并创建 Win32 窗口，再调用 `Start(hwnd)` 初始化渲染部分。运行循环通过 `PeekMessage` 处理窗口消息，并调用 `Update()` 更新画面。

核心代码按职责拆成 `Render`、`Mesh`、`Shader` 和 `Camera`：渲染模块组织设备和绘制流程，网格模块准备几何数据，着色器模块连接 HLSL，相机模块提供视图与投影矩阵。

## 设备、交换链与输出目标

`SetupDX11` 创建 D3D11 设备和设备上下文，随后建立 DXGI 交换链，从后备缓冲区创建渲染目标视图，最后设置视口。当前代码中的窗口、交换链与视口使用固定的 1280 × 800 尺寸。

这部分把“窗口在哪里”和“画面画到哪里”连接起来。继续阅读时，可以沿着设备、交换链、后备缓冲区、渲染目标的关系追踪对象的创建与使用。

## 一帧绘制经过什么

网格代码包含球体与立方体的生成函数，当前初始化选择了球体。顶点保存位置、法线和纹理坐标，顶点与索引分别进入对应缓冲区。

每帧先清理渲染目标，再绑定缓冲区、输入布局与三角形拓扑，设置顶点着色器和像素着色器，更新变换相关数据，最后执行索引绘制并呈现。下面是渲染模块中的调用片段：

```cpp
UpdateMesh();
UpdateVSConstantBuffer(mainDeviceContext);
mainDeviceContext->VSSetConstantBuffers(0, 1, &vsConstantBuffer);
mainDeviceContext->DrawIndexed(indices.size(), 0, 0);
g_pSwapChain->Present(1, 0);
```

顺着这几步查看上下文，可以把 CPU 侧的几何数据、变换矩阵与 GPU 绘制命令联系起来。

## 把它作为实验起点

这个仓库适合阅读基础管线，或在小规模工程里尝试修改几何、着色器与相机。窗口尺寸适配、资源生命周期和更完整的运行循环等工程细节，仍需要在扩展时逐项检查。本站另有[自研 C++ 游戏引擎介绍](/blog/cpp-game-engine-introduction/)，两者各有独立的展示内容。

AI 使用程度：**轻度使用**，按作者确认的项目标签记录。

[查看项目详情](/projects/dx11-template/) · [GitHub 仓库](https://github.com/binbinku/DX11Template) · [本文参考的渲染源码](https://github.com/binbinku/DX11Template/blob/dda6d03affbafd3fccb4182f07445281a12c210f/Base/Core/Render.cpp)

本文根据 2026-10-29 查阅的源码整理，未在本文中作编译或运行结果承诺。
