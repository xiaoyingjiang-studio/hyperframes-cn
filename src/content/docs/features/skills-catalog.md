---
title: "Skills 与组件目录"
description: "让 Agent 理解视频规范，并复用可编辑的视觉模块。"
contentId: "features-skills-catalog"
kind: "adaptation"
sources: ["guides-skills","guides-plugins","catalog-index"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
sidebar: {"order":13}
---

Skills 和 Catalog 解决不同问题：前者告诉 Agent 如何工作，后者提供可以放进项目的区块与组件。

## Skills 提供工作规范

通用编程工具未必知道视频的时间轴、媒体或渲染约定。官方 Skills 提供制作流程与参考资料。安装后要确认 Agent 确实读取技能，并检查实际调用名称。

~~~bash
npx skills add heygen-com/hyperframes
~~~

官方也提供与 CLI 版本配套的 Skills 更新入口：

~~~bash
npx hyperframes skills update
~~~

不同安装方式的更新机制不同，不建议在同一项目里不加区分地叠加多套安装来源。

## Catalog 提供可编辑素材

区块通常承载一个较完整的画面或效果，组件适合更局部的行为。先在[官方 Catalog](https://hyperframes.heygen.com/catalog)查看效果与适用方式，再安装到项目。

~~~bash
npx hyperframes add data-chart
~~~

安装后检查新增文件、引用路径和依赖，再修改样式与内容。不要认为名称相近的组件就一定有相同参数。

## 版本管理建议

把使用的 CLI、Skills 来源和组件修改记录在项目说明里。遇到同一个提示词结果突然变化时，先比较工具与技能版本，再判断是否需要调整提示词。
