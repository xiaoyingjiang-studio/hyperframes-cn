---
title: "Windows 环境准备"
description: "检查 Node.js、FFmpeg、终端路径和浏览器依赖。"
contentId: "guides-windows"
kind: "tutorial"
sources: ["quickstart","developers-cli","help"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
verification: "本工程在 Windows / Node.js 24.16.0 环境制作；具体渲染结果另存案例验证记录。"
sidebar: {"order":17}
---

本页面向 Windows 的 CLI 与 Agent 使用路径。Studio 的独立安装步骤见[Studio 教程](/start/studio/)。

## 在终端确认基础工具

安装官方支持的 Node.js 版本与 FFmpeg 后，重新打开 PowerShell，运行：

~~~powershell
node --version
npm --version
ffmpeg -version
~~~

出现“无法识别命令”通常意味着工具未安装、PATH 未更新，或终端仍保留旧环境。先解决对应命令，再继续安装 HyperFrames。

## 选择简单且独立的项目位置

首次尝试建议使用自己有写入权限的目录。路径含空格时按 PowerShell 规则加引号；媒体路径尽量保留在项目内。不要为了运行项目而随意修改系统目录或全局安全策略。

## 检查渲染环境

~~~powershell
npx hyperframes doctor
npx hyperframes render --help
~~~

初次使用可能需要浏览器下载。公司网络下的证书、代理或下载限制，应按实际环境处理；不要把关闭证书校验作为默认教程步骤。

## 区分三个故障位置

安装包下载失败，检查网络与依赖下载；CLI 能启动但浏览器失败，检查浏览器路径和诊断输出；浏览器正常但成片不完整，检查媒体加载、编码器与文件权限。

反馈时提供系统版本、Node/CLI 版本、工作目录和脱敏后的完整错误，避免只写“Windows 不能用”。本站四个案例的具体环境与结果见案例说明和维护手册。
