---
title: 理解自动检查的边界
description: >-
  自动检查帮助发现格式、运行、布局、动作和对比度等问题。官方 CLI 技能把 check
  放在最终检查环节，并要求查看抽帧。检查结果是定位问题的工具，不能代替观看作品。
contentId: mechanisms-checks
kind: mechanism
sources:
  - official-skills-hyperframes
  - official-skills-hyperframes-cli-references-lint-validate-inspect
appliesTo: 官方公开资料 v0.9.94；Studio 桌面应用版本需另行确认
status: source-based
verification: 基于固定官方资料整理并执行结构与来源检查；未在本轮登录 Studio、连接 Agent 或调用付费服务。
---
自动检查帮助发现格式、运行、布局、动作和对比度等问题。官方 CLI 技能把 check 放在最终检查环节，并要求查看抽帧。检查结果是定位问题的工具，不能代替观看作品。

## 怎样用于创作

先处理错误，再结合画面判断警告。对于有意的重叠、溢出或遮挡，应确认意图与实际画面一致；不要为了通过检查而随意忽略。向 Agent 提供具体错误和发生位置，比只要求“修复所有问题”更有依据。

## 怎样检查结果

检查关键静帧之后，还要播放完整视频和声音。关注信息顺序、节奏、错字、素材真实性与最终文件。记录运行了哪个命令、针对哪个项目及版本，不把官方示例结果写成本次实测。

## 条件与边界

自动检查不能证明故事清晰、营销事实正确、素材授权充分或所有设备均可播放。没有运行过的检查只能描述操作方法，不能标成已经通过。

## 下一步

在[Studio 首次创作](/start/studio/)中实践，再用[问题排查](/guides/troubleshooting/)记录遇到的现象。需要工具分工时，查看[Skills 与组件目录](/features/skills-catalog/)。
