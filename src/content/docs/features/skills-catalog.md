---
title: "Skills 与组件目录"
description: "让 Agent 理解视频规范，并复用可编辑的视觉模块。"
contentId: "features-skills-catalog"
kind: "adaptation"
sources: ["guides-skills","guides-plugins","catalog-index","official-skills-manifest"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
sidebar: {"order":13}
---

Skills 规定 Agent 怎样工作，组件与区块提供可以放入项目的视觉内容，Studio 的工具菜单则是应用中的操作入口。这三者相关，但不能互相替代。正式 skills 清单来自官方发布文件；仓库开发用技能与组件附带说明不计入正式安装清单。

## 按创作任务选择 skill

| 创作需要 | Skill 与职责 |
| --- | --- |
| 完整视频、项目与检查规范 | [hyperframes](/skills/hyperframes/)：先理解共同制作约定，再选择具体能力 |
| 建项目、读时间轴、预览与渲染 | [hyperframes-cli](/skills/hyperframes-cli/)：按操作任务使用工具并排查错误 |
| 标题、转场、图表和视觉模块 | [hyperframes-registry](/skills/hyperframes-registry/)：搜索、安装和接入可编辑内容 |
| 图片、音效、配音、视频与调色 | [media-use](/skills/media-use/)：复用、获取、生成和处理媒体 |
| 重建一个具体视频 | [reverse-any-video](/skills/reverse-any-video/)：以原视频为依据重建并对照 |
| 按风格做新主题的一集 | [style-sampling](/skills/style-sampling/)：采用模板的结构、节奏与输入要求 |
| 将设计稿用于视频 | [figma](/skills/figma/)：获取设计素材、品牌与分镜信息 |
| 现场播放的交互演示 | [slideshow](/skills/slideshow/)：页面、逐步显现、分支与备注 |
| 复用其他工具的动画与成片 | [remotion-to-hyperframes](/skills/remotion-to-hyperframes/)：选择合适的导入与编辑层级 |

## 这些技能怎样协作

一个产品介绍可能同时需要完整视频规范、目录中的卡片布局以及已有截图；它们分别由制作约定、registry 与媒体流程支持。先描述创作目标和已有材料，再让 Agent 按任务采用合适的能力。技能之间的引用是公开工作约定，不代表模型每次内部调用顺序完全相同。

## 安装与更新

在所用 Agent 支持的方式中安装，已有版本化插件则按插件的更新机制操作。单独安装技能与应用菜单不是同一件事，安装后确认 Agent 已发现技能，必要时重新开始会话。

~~~bash
npx skills add heygen-com/hyperframes
npx hyperframes skills update
~~~

默认核心集合与按需安装项以对应版本的官方说明为准。不要把不同工具中的同名技能或本地自定义版本混成一个来源，也不要在同一项目中无区别叠加多种安装方式。

## 组件与区块怎样选择

从[官方 Catalog](https://hyperframes.heygen.com/catalog)按画面用途查找：标题、转场、字幕、图表、地图、三维与其他效果。区块通常包含完整画面结构，组件适合局部能力；安装后检查实际文件、依赖和挂载方式，再调整尺寸、文字与时间。

~~~bash
npx hyperframes add data-chart
~~~

资源目录不是成片质量或服务费用的保证。先说明信息职责、输入和可编辑要求，再选资源。需要理解素材关系时，继续阅读[素材、生成内容与组件](/mechanisms/media-and-blocks/)。
