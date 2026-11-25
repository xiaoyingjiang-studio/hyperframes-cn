---
title: 理解可编辑项目与素材
description: >-
  成片和可编辑项目承担不同职责：视频文件用于播放与交付，项目保存场景、文字、媒体、时间安排和可调整的变量。HyperFrames
  用合成文件描述画面，根合成可以引用子合成，便于单独修改或复用一个场景。
contentId: mechanisms-editable-project
kind: mechanism
sources:
  - concepts-compositions
  - official-docs-concepts-variables
appliesTo: 官方公开资料 v0.9.94；Studio 桌面应用版本需另行确认
status: source-based
verification: 基于固定官方资料整理并执行结构与来源检查；未在本轮登录 Studio、连接 Agent 或调用付费服务。
---
成片和可编辑项目承担不同职责：视频文件用于播放与交付，项目保存场景、文字、媒体、时间安排和可调整的变量。HyperFrames 用合成文件描述画面，根合成可以引用子合成，便于单独修改或复用一个场景。

## 怎样用于创作

把标题、品牌颜色、人物图片等经常变化的内容与固定结构分开。需要做系列视频时，先确定不变的版式和节奏，再把要替换的文字、颜色和素材暴露为变量。改变结构时仍需要修改项目，变量并不能代替所有编辑。

## 怎样检查结果

复用前检查原有素材路径、字体、时长和变量是否完整。换成长标题后重新查看断行；换成不同比例的图片后检查裁切。项目能打开，并不表示替换后的内容已经适合交付。

## 条件与边界

导出 MP4 不会自动得到一个能修改全部内部元素的源项目。素材视频的像素内容与原生文字图形的可编辑程度不同；交接时保存项目文件、素材及其来源。

## 下一步

在[Studio 首次创作](/start/studio/)中实践，再用[问题排查](/guides/troubleshooting/)记录遇到的现象。需要工具分工时，查看[Skills 与组件目录](/features/skills-catalog/)。
