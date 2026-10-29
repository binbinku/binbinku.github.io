---
title: 'BKEFTTools：从武器预设找到模型与纹理资源'
description: '把预设、物品数据库与资源包关联起来，用 C# 桌面界面组织 EFT 资源导出流程。'
pubDate: 2026-10-29
tags: ['项目介绍', '.NET', '资源工具']
draft: false
---

一套武器预设会涉及主体、配件和多个资源包。手动逐个查找时，需要先确认物品对应的资源，再补齐依赖。BKEFTTools 把预设作为入口，将物品数据与 Bundle 信息关联，再调用 AssetStudioCLI 处理模型、纹理等资源。

![BKEFTTools 物品预设界面](/images/projects/eft-tools-preset.png)

## 从数据建立关联

项目采用 C#、.NET 8 与 WPF，使用 Newtonsoft.Json 读取数据。界面包括设置、物品数据库、内置预设和用户预设等部分。

`DBManager` 负责加载设置、全局数据、物品数据库、Bundle 数据库与用户档案列表。导出流程从预设中的物品模板 ID 找到物品信息，再由物品的 Prefab 路径定位对应资源包。用户保存的武器配置会先转换为同一种预设结构，进入共用的导出逻辑。

## 按预设和插槽组织导出

`ExportManager` 遍历预设中的物品，为主体与各配件建立输出目录。没有插槽标识的主体使用 `weapon_root`，其他部分按插槽与物品名称组织，方便对照一套武器的组成。

找到主资源包后，代码还会检查依赖包：筛选武器与物品目录中的依赖，并跳过部分动画和手部相关内容。实际解包由外部 AssetStudioCLI 进程执行，项目负责数据关联、路径组织和任务调用。

导出同名预设时，当前实现会删除该预设原有的输出目录，再重新生成。因此已有手动整理内容应放在独立位置，具体输出路径可在源码的路径定义中核对。

## 版本与使用范围

README 标记版本为 V0.01，列出的测试组合是 EFT Client 0.14.1.2.29197、SPT AKI Server 3.8.0.0 与 AssetStudioCLI 1.36.0.0。读取路径、数据库结构和导出筛选与这类数据格式关联，不能直接把这份测试记录理解成对所有后续版本的兼容承诺。

从开发角度看，这个项目展示的是一条清晰的数据处理路径：预设描述组成，数据库解释物品，Bundle 信息定位文件，外部工具完成解包。阅读时从 `DBManager` 与 `ExportManager` 入手，比只看界面更容易理解各层关系。

AI 使用程度：**没有使用**，按作者确认的项目标签记录。

[查看项目详情与 README](/projects/eft-tools/) · [GitHub 仓库](https://github.com/binbinku/BKEFTTools) · [本文参考的导出源码](https://github.com/binbinku/BKEFTTools/blob/8cc92b37e95b753f8316ae722aa61efc7497b9ec/BKEFTTools/Manager/ExportManager.cs)

本文根据 2026-10-29 保存的文档与查阅的源码整理。
