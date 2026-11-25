---
title: "常见问题与排错"
description: "按安装、预览、画面和导出四层定位问题。"
contentId: "guides-troubleshooting"
kind: "adaptation"
sources: ["help","developers-cli","guides-performance"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
sidebar: {"order":19}
---

排错时先找到失败发生在哪一步，再做最小修改。保存原始项目与错误，不要一开始就同时重装所有工具。

## 安装或命令无法启动

检查 Node.js 是否满足当前版本要求、终端能否找到命令、网络能否下载依赖、项目目录是否有写入权限。在新终端验证版本，避免旧 PATH 影响判断。

## 预览打不开或画面空白

使用终端实际输出的地址，不猜端口。检查项目入口、浏览器控制台、媒体路径和依赖文件。如果根内容被放在不显示的模板中，或动画时间轴没有按规范注册，页面可能存在但没有画面。

## 中文缺字、超出画面或字幕太快

确认渲染环境安装了相应字体，先让文字在静态布局中完整显示，再检查动画与时长。更具体的建议见[中文排版实践](/guides/chinese-typography/)。

## 预览正常但导出失败

~~~bash
npx hyperframes doctor
npx hyperframes lint
npx hyperframes check
~~~

检查 FFmpeg、浏览器、媒体访问、编码错误与内存。先用短项目和较小画面复现，再逐步恢复复杂效果；不把降低质量当作长期掩盖项目结构问题的方式。

## 如何提交有用的问题

提供系统、Node 和 CLI 版本、执行命令、预期与实际结果、可复现的最小项目。删除密钥、私人素材和本地隐私信息。中文站内容错误可用页尾反馈链接；框架问题建议同时提供[官方仓库](https://github.com/heygen-com/hyperframes/issues)能使用的复现信息。
