---
title: "参与贡献"
description: "从纠错、实践案例到维护工具，都能参与。"
contentId: "community-contributing"
kind: "original"
sources: []
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "practice"
sidebar: {"order":29}
---

欢迎通过 GitHub Issues 和 Pull Requests 改善中文内容。优先提交可核对、可复现的小改动。

## 提交内容问题

说明页面地址、哪句话或哪个步骤有问题、你的环境与实际结果。涉及功能或参数变化时附官方来源；涉及错误时提供脱敏日志，避免上传密钥和私人素材。

## 修改页面

从页面的编辑入口或仓库找到对应 Markdown 文件，保留稳定 contentId 与路由。正文修订后运行内容校验与构建；如果修改了事实依据，更新来源映射并明确核对范围。

不要仅为了“看起来新”修改核对日期。教程有未执行步骤时，应保留验证限制。

## 新增案例

提交源项目、依赖版本、输入素材与许可、实际渲染结果、复现命令和结果说明。虚构数据须明确标注；概念界面不能描述为真实产品截图。

## 审核与发布

PR 先通过类型、内容、链接和构建检查，再由维护者查看差异与预览。AI 候选稿也走相同审核流程，机器人不自动发布正文。

## 本地开发

~~~bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm build
~~~

完整部署、预览授权和来源复核命令见仓库的中文 README 与维护者手册。代码及内容采用不同许可，提交前请阅读[许可说明](/community/licenses/)。
