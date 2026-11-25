---
title: "动画与视觉效果"
description: "理解时间轴、可寻址动画、转场与组件的关系。"
contentId: "features-motion"
kind: "adaptation"
sources: ["guides-gsap-animation","prompting-motion","concepts-frame-adapters"]
reviewedAt: "2026-11-25"
appliesTo: "官方文档 main；功能以当前安装版本为准"
status: "reviewed"
sidebar: {"order":11}
---

动画应帮助观众理解“什么发生了变化”。常见任务包括标题入场、图表增长、界面聚焦、场景切换与镜头运动。

## 先布局，再安排运动

先确定元素完整显示时的位置和大小，再添加进入与离开动画。中文标题的最长文本必须放得下；不要用动画掩盖布局冲突。

## 可寻址时间轴

HyperFrames 渲染时会寻找指定时间点。GSAP 是常见选择，动画需按当前框架约定注册，并由播放器或渲染器控制。不要依赖页面真实运行了几秒来决定画面状态。

下面表达的是时间轴思路，完整结构以[项目示例](/showcase/product-intro/)和官方文档为准：

~~~js
const tl = gsap.timeline({ paused: true });
tl.from('.title', { y: 30, opacity: 0, duration: 0.6 }, 0);
window.__timelines = window.__timelines || {};
window.__timelines['intro'] = tl;
~~~

## 转场与视觉效果

明确从哪个画面到哪个画面，再选择淡入、遮罩、位移或镜头变化。Catalog 提供现成区块与组件，可先查找合适效果，再调整参数。复杂效果同时增加渲染与检查成本，建议先在短项目中验证。

## 预览之外还要抽帧

检查开场、运动中途、转场边界和末尾，特别关注快速移动的文字是否溢出、画面是否过暗。网页中的“减少动态效果”设置不自动代替视频的可读性设计。
