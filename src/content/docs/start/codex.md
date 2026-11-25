---
title: "使用 Codex 创建视频"
description: "安装 Skills，让 Codex 按视频项目规范创作、预览并修改。"
contentId: "start-codex"
kind: "tutorial"
sources: ["guides-with-codex","guides-skills","guides-plugins"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
verification: "已核对官方文档；账号登录与 Agent 会话未在本环境实操。CLI 原创案例另有渲染记录。"
sidebar: {"order":5}
---

适合已能独立使用 Codex 的用户。目标是创建一个本地短片项目，并能找到文件、打开预览、继续修改。

## 环境与项目目录

先确认 Codex 自身已经可用。创建独立文件夹，不在 HyperFrames 官方源码目录里安装项目 Skills。需要本地 CLI 时准备 Node.js 22 或更新的兼容版本及 FFmpeg，详细步骤见[Windows 环境](/guides/windows/)。

在准备好的视频项目目录中运行官方 Skills 安装入口：

~~~bash
npx skills add heygen-com/hyperframes
~~~

根据安装器选择当前 Agent 和 Core Skills，完成后重新打开或刷新对应会话。Codex 中通常可以用 `$hyperframes` 显式调用技能；插件安装方式及技能入口请对照官方当前指南。

## 发起第一次制作

在会话里明确调用已安装的技能，输入：

> 使用 $hyperframes，制作一个 8 秒的中文标题动画。画面 16:9，标题是“让想法成为下一帧”，深色背景、薄荷绿强调，只使用文字和图形。先检查本地依赖，说明项目存放位置，再完成预览和渲染。不要使用外部付费素材服务。

技能在不同安装方式下可能有不同调用名称；以 Agent 实际列出的技能为准，不把普通对话里输入名称当作已安装成功。

## 确认 Agent 完成了什么

要求它报告项目目录、主要文件、预览入口和导出文件位置。确认产生的是 HyperFrames 项目，且检查和渲染真正执行成功；若缺少依赖，先解决依赖再继续。

## 用一次修改验证可编辑性

继续输入：“把强调词改为下一帧，让标题入场更慢，最后完整停留两秒，重新检查并导出。”

打开新导出的视频确认变化。保存源文件和素材，而不仅保存 MP4。想自己理解命令，可以接着读[CLI 教程](/start/cli/)；想减少反复修改，可以读[提示词与迭代](/guides/prompting/)。
