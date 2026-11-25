---
title: "预览、渲染与分享"
description: "完成检查、输出成片，并区分本地导出与在线分享。"
contentId: "features-render-share"
kind: "adaptation"
sources: ["guides-rendering","guides-export-and-share","developers-cli"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
sidebar: {"order":14}
---

预览用于快速观察和修改，渲染生成最终文件，分享则把结果交给其他人审阅。三者需要分别确认成功。

## 本地工作循环

~~~bash
npx hyperframes preview
npx hyperframes lint
npx hyperframes check
npx hyperframes render --output output.mp4
~~~

具体检查参数以当前 CLI 帮助为准。检查通过之后仍需打开视频：确认时长、尺寸、第一帧、片尾、字幕与声音。预览中能看到一张图，不等于导出时一定加载完整。

## 抽帧与验收

对短片至少检查开头、中间和结尾；对复杂动画增加转场边界和信息最密集时刻。保留检查结果与文件版本，便于反馈。

~~~bash
npx hyperframes snapshot --at 0,2,5
~~~

## 在线分享的条件

在线分享可能涉及登录、项目可见性、工作区额度或上传。先核对当前账号和官方分享指南，再决定哪些人可以查看，不把本地输出目录当作已经公开可访问的链接。

如果只需要交付文件，发送导出的 MP4 与必要说明即可。若还需要继续编辑，应一并保留源项目、媒体和依赖记录。

## 渲染失败时

先记录完整错误与 CLI 版本，运行诊断，再检查浏览器、FFmpeg、文件路径和外部资源。更多排查顺序见[常见问题](/guides/troubleshooting/)。
