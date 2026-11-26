---
title: Skills 与创作工具总览
description: >-
  Skill 是给 Agent 的工作说明，帮助它按任务准备输入、使用工具和检查结果。先认识整体创作、CLI
  和媒体三种基础分工，再按模块、设计稿、参考、演示或迁移选择专项方法，并核对实际安装与服务条件。
contentId: learn-skills
kind: catalog
sources:
  - guides-skills
  - guides-plugins
  - catalog-index
  - official-skills-manifest
  - official-skills-hyperframes
  - official-skills-figma
appliesTo: 本站学习导航；各能力以所链接文章的适用入口为准
status: source-based
verification: 本站编排的学习路径，来源沿用所引文章的固定资料；未在本轮执行桌面登录、Agent 创作或付费服务。
---
Skill 可以先理解为交给 Agent 的一套工作说明：遇到某种任务时，应该怎样准备、使用哪些工具、遵守什么规则、怎样检查结果。它不是单独的视频素材，也不等于桌面应用中的一个按钮。

这一栏帮助你按问题选择方法，而不是背一串英文名称。目录按照正式发布清单整理；仓库开发用的说明和组件附带文件，不会仅因名称相似就算作正式内置功能。

## 先认识三个基础分工

hyperframes 负责整体视频创作约定；hyperframes-cli 说明怎样操作、检查和输出项目；media-use 处理媒体获取、生成与处理。它们可能在一次任务中配合使用，并不互相替代。

例如制作产品介绍，整体 skill 组织场景；需要素材时进入媒体流程；制作后用检查与抽帧工具看结果。你可以描述完整任务，Agent 根据实际安装与发现结果选择工具，不必把每句话都改写成命令。

## 按实际任务选择专项方法

| 你遇到的任务 | 阅读入口 | 先理解的区别 |
| --- | --- | --- |
| 制作或编辑完整视频 | [hyperframes](/skills/hyperframes/) | 项目结构与整体工作过程 |
| 检查、预览和交付 | [hyperframes-cli](/skills/hyperframes-cli/) | 每种工具证明什么 |
| 缺少媒体素材 | [media-use](/skills/media-use/) | 复用、检索与生成 |
| 找标题、转场或图表模块 | [registry](/skills/hyperframes-registry/) | 场景块与组件 |
| 用设计稿中的内容 | [figma](/skills/figma/) | 素材、组件与连续状态 |

还有 [重建参考视频](/skills/reverse-any-video/)、[系列风格创作](/skills/style-sampling/)、[现场演示](/skills/slideshow/) 和 [迁移其他工具作品](/skills/remotion-to-hyperframes/)。这几种目标的输入与交付物明显不同，选之前先读开头的适用场景。

## 怎样判断自己真的能用

正式发布、已经安装、当前 Agent 能发现、账号满足服务条件，是不同事实。安装与完整清单见 [Skills 与组件目录](/features/skills-catalog/)，实际名称和可用项以当前环境为准。

每篇解析会解释任务、过程、边界和检查方法。需求示例只用于表达，不是执行记录；版本、来源与实测范围单独展示。想了解工具为什么这样配合，继续读 [创作机制](/learn/mechanisms/)。
