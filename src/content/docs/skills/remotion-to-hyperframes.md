---
title: remotion-to-hyperframes：复用其他工具制作的项目与画面
description: >-
  已有 Remotion 或其他动画工具的代码、视频与逐帧输出，希望放入 HyperFrames
  继续使用时选择。提供源项目或输出文件，说明希望保留哪些可编辑能力；结果按原生、托管或媒体层级导入。
contentId: skills-remotion-to-hyperframes
kind: skill
sources:
  - official-skills-remotion-to-hyperframes
appliesTo: 官方公开资料 v0.9.94；Studio 桌面应用版本需另行确认
status: source-based
verification: 基于固定官方资料整理并执行结构与来源检查；未在本轮登录 Studio、连接 Agent 或调用付费服务。
---
已有 Remotion 或其他动画工具的代码、视频与逐帧输出，希望放入 HyperFrames 继续使用时选择。

## 输入与输出

提供源项目或输出文件，说明希望保留哪些可编辑能力；结果按原生、托管或媒体层级导入。

## 关键规则与影响

原生转换可保留更多元素编辑，托管内容主要调整时间和暴露参数，媒体文件主要用于剪切、布局与叠加。每种方式都需要与原始输出比较。

## 可以怎样表达需求

以下为本站整理的需求示例，不是实际运行记录：

> 把这段动画加入新项目，优先保留可调整标题与颜色；无法保留的部分明确记录为视频素材。

## 职责边界与常见误用

导入一个成片不会自动恢复其中所有内部元素。依赖实时网络或不可寻址行为的内容，不能直接承诺逐帧一致。

## 入口、版本与下一步

本页解释官方正式发布的 Agent skill，不将其自动视为所有 Studio 版本内置的菜单项。技能安装方式和实际发现结果见[Skills 总览](/features/skills-catalog/)，操作中以当前工具显示的名称为准。需要素材时结合 [media-use](/skills/media-use/)，需要完整制作约定时回到 [hyperframes](/skills/hyperframes/)。本页来源固定到 v0.9.94 的仓库提交；账号与服务条件不代表本环境已实测。
