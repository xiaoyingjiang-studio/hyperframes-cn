---
title: 让修改准确落在画面上
description: >-
  Studio 的选取、画圈和评论用于告诉
  Agent“改哪里”。公开文档说明，可以选择元素、在画面上绘制标记，或给某个位置与时刻留下评论。它们提供定位上下文，具体修改仍需要配合文字要求。
contentId: mechanisms-targeted-edits
kind: mechanism
sources:
  - studio-app-edit-with-the-agent
appliesTo: 官方公开资料 v0.9.94；Studio 桌面应用版本需另行确认
status: source-based
verification: 基于固定官方资料整理并执行结构与来源检查；未在本轮登录 Studio、连接 Agent 或调用付费服务。
---
Studio 的选取、画圈和评论用于告诉 Agent“改哪里”。公开文档说明，可以选择元素、在画面上绘制标记，或给某个位置与时刻留下评论。它们提供定位上下文，具体修改仍需要配合文字要求。

## 怎样用于创作

先停在问题出现的位置。能直接选中的对象用 Select；需要指明一片区域时用 Draw；需要绑定时刻与位置时用 Comment。说明对象、要改成什么，以及哪些内容保持原样。

## 怎样检查结果

例如：圈出右侧标题，写“缩短为两行，保持原来的颜色和进入时间”。发送前核对待处理行是否对应正确位置，发送后回到同一时刻比较，并检查前后动作。

## 条件与边界

画圈不是自动修复，也不是直接生成的遮罩承诺。官方资料没有公开的内部解析过程不作推断。素材画面中的物体与原生可编辑元素也不能保证有相同的编辑方式。

## 下一步

在[Studio 首次创作](/start/studio/)中实践，再用[问题排查](/guides/troubleshooting/)记录遇到的现象。需要工具分工时，查看[Skills 与组件目录](/features/skills-catalog/)。
