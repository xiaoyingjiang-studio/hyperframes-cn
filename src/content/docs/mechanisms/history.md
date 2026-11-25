---
title: 保留修改与恢复项目
description: >-
  手动编辑与 Agent 修改可能作用于同一项目。Studio 提供撤销、重做以及对已完成 Agent 操作的回退入口；从外部 Agent
  切换到应用后，返回时也应先了解应用中的改动。
contentId: mechanisms-history
kind: mechanism
sources:
  - studio-app-edit-with-the-agent
  - official-skills-hyperframes-cli
appliesTo: 官方公开资料 v0.9.94；Studio 桌面应用版本需另行确认
status: source-based
verification: 基于固定官方资料整理并执行结构与来源检查；未在本轮登录 Studio、连接 Agent 或调用付费服务。
---
手动编辑与 Agent 修改可能作用于同一项目。Studio 提供撤销、重做以及对已完成 Agent 操作的回退入口；从外部 Agent 切换到应用后，返回时也应先了解应用中的改动。

## 怎样用于创作

修改前保存当前目标和要保持的部分。需要比较方案时，保留项目副本或明确的恢复点。回到 Agent 时说明刚刚在应用中做了什么，避免旧上下文覆盖新调整。

## 怎样检查结果

撤销后查看是否回到预期版本，再从该版本继续。恢复项目时检查素材仍存在、引用路径有效、字体完整；能够看到旧预览并不表示源文件已经全部恢复。

## 条件与边界

命令行交接和会话延续受平台与启动方式影响。官方文档分别说明支持条件，不承诺 Windows、Linux 与 Mac 的体验一致；恢复成片文件也不能替代恢复可编辑项目。

## 下一步

在[Studio 首次创作](/start/studio/)中实践，再用[问题排查](/guides/troubleshooting/)记录遇到的现象。需要工具分工时，查看[Skills 与组件目录](/features/skills-catalog/)。
