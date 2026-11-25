---
title: "HyperFrames 是什么"
description: "理解产品、开源框架与可编辑项目之间的关系。"
contentId: "overview-what-is-hyperframes"
kind: "adaptation"
sources: ["introduction","concepts-determinism"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
sidebar: {"order":1}
---

HyperFrames 是 HeyGen 开发的视频创作工具与开源框架。你可以描述一个需求，让 Agent 创建项目；也可以带入自己的素材，继续修改字幕、画面与节奏。

## 从想法到项目

底层项目由 HTML、CSS、JavaScript、媒体文件及可寻址动画构成。浏览器预览与最终渲染读取这些文件，所以作品可以继续检查、修改和纳入版本管理。

一个简单的流程是：先描述视频给谁看、讲什么，再生成项目、预览关键帧、提出修改，最后渲染 MP4。对创作者来说，关键是表达需求；对开发者来说，项目文件让精确控制和自动化成为可能。

## 产品由哪些部分组成

| 部分 | 用途 |
| --- | --- |
| Studio 桌面应用 | 在桌面工作区里与 Agent 协作、查看作品和继续编辑 |
| Agent Skills | 为 Codex、Claude Code 等工具提供视频项目的结构与工作流程 |
| CLI 与渲染框架 | 创建、检查、预览与渲染项目，可接入开发流程 |
| Catalog | 提供可编辑的区块与组件，减少重复制作 |

Studio、浏览器预览编辑器和在线聊天连接入口是不同使用界面。它们的账号、网络和服务条件需要分别核对。

## 为什么动画要能跳转时间

渲染器需要在指定时间点恢复画面，再逐帧输出。依赖真实时间流逝的随机动画，可能在预览与导出时出现不同结果。可寻址、确定性的时间轴让修改和排错更加可靠。

如果你只想开始创作，可以先读[选择使用方式](/overview/choose-your-path/)；希望理解文件如何组织，可以读[项目结构](/guides/project-structure/)。
