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
status: "auto-checked"
verification: 基于固定官方资料整理并执行结构与来源检查；未在本轮登录 Studio、连接 Agent 或调用付费服务。
---

自动检查是定位问题的工具，不是作品合格的证明。它能帮你发现格式、运行、布局、动作和对比度方面的问题，但故事是否清晰、事实是否准确、素材授权是否充分，仍要由创作者自己判断。

## 自动检查能发现什么

按官方 CLI 技能（Skill）的说明，`check` 是最终检查环节：它先运行同一套 linter，再在同一个浏览器会话中审计运行时、布局、动作和对比度。`lint` 适合在迭代过程中提供快速的静态反馈。

如果 linter 报错，检查会失败，但浏览器审计仍会继续并一并报告；除非错误导致没有可加载的合成（例如根节点缺少 `data-composition-id`）。当浏览器根本没有运行（没有可加载的合成、linter 崩溃或浏览器启动失败）时，`browserSkipped` 为 `true`，布局、动作和对比度部分为空，而不是“干净通过”。这一点很关键：空结果不等于没有问题。

`check` 还支持一些针对性参数。`--caption-zone` 接收分数形式的带状区域（`x0/y0/x1/y1` 必填，取合成自身画布的 0–1 比例，竖屏同样适用），可带 `severity` 和逗号分隔的 `seek` 比例，用来标记文本元素的 DOM 盒与该区域重叠。若下三分之一字幕是有意放置，可在元素或其最近包裹层加 `data-layout-allow-caption-zone` 豁免。`--frame-check` 报告超出画布超过 `max(120px, 6% 最小画布尺寸)` 的媒体元素。

## 怎样用于创作

先处理错误，再结合画面判断警告。对于有意的重叠、溢出或遮挡，应确认意图与实际画面一致，而不是为了通过检查随意忽略。向 Agent 提供具体错误和发生位置，比只说“修复所有问题”更有依据。

官方技能把 `check` 放在最终检查环节，并要求查看抽帧。`snapshot` 是单独截取静帧和放大局部画面的工具。检查关键静帧之后，还要播放完整视频和声音，关注信息顺序、节奏、错字、素材真实性与最终文件。

## 怎样检查结果

运行 `check` 时用 `npx hyperframes check`，不要通过 `npm run`：工具超时的 SIGTERM 会立刻结束 npm，而 `check` 会继续运行，并把报告保存到它在 stderr 中给出的文件（`.hyperframes/artifacts/checks/`）。一条命令，一次 Chrome 启动。不要在 `check` 前紧接一个多余的独立 `lint`。

记录你运行了哪个命令、针对哪个项目及版本。没有运行过的检查只能描述操作方法，不能标成已经通过；也不要把官方示例结果写成本次实测。

## 条件与边界

自动检查不能证明故事清晰、营销事实正确、素材授权充分，也不能证明所有设备均可播放。它给出的是可定位的信号，最终判断仍要回到完整播放与人工审看。

## 下一步

在 [Studio 首次创作](/start/studio/) 中实践，再用[问题排查](/guides/troubleshooting/)记录遇到的现象。需要工具分工时，查看 [Skills 与组件目录](/features/skills-catalog/)。
