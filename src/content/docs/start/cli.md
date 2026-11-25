---
title: "CLI 快速开始"
description: "创建、检查、预览、渲染，完成一次本地视频制作循环。"
contentId: "start-cli"
kind: "tutorial"
sources: ["developers-cli","packages-cli","quickstart"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
verification: "本站四个原创案例将记录实际 CLI、渲染与媒体检查结果；交互式 init 步骤按官方文档整理。"
sidebar: {"order":8}
---

适合能运行终端命令的用户。准备 Node.js 22 或更新的兼容版本、FFmpeg，以及 CLI 能够启动的 Chromium 环境。本站维护工程使用 Node.js 24，这与视频项目的最低要求是两件事。

## 创建与预览

在准备存放项目的位置运行：

~~~bash
npx hyperframes init my-video
cd my-video
npx hyperframes preview
~~~

按初始化提示选择模板，然后在终端显示的地址打开浏览器预览。初次运行可能需要下载软件或浏览器；保留报错信息，不要在失败后直接跳到导出步骤。

## 检查项目

~~~bash
npx hyperframes lint
npx hyperframes check
npx hyperframes snapshot --at 0,2,5
~~~

结构检查、浏览器检查和截图各有用途。查看开场、标题最完整的时刻、转场和片尾；不要只看命令退出成功。

## 渲染并检查文件

~~~bash
npx hyperframes render --output output.mp4
~~~

用播放器打开输出文件，确认尺寸、时长、字幕和音画。如果预览正常而导出不同，优先检查动画是否可寻址、是否依赖外部资源、媒体是否加载完整。

## 用安装版本的帮助核对参数

~~~bash
npx hyperframes render --help
npx hyperframes doctor
~~~

CLI 能力会持续变化，当前安装版本的帮助优先于教程中未注明的新参数。可从[原创案例](/showcase/)下载项目源码，并按案例说明复现。
