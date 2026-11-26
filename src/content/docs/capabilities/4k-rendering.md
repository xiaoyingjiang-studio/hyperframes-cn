---
title: 用 HyperFrames 输出 4K 视频：两种路径与检查要点
description: >-
  HyperFrames 支持两种 4K 路径：渲染时用 --resolution 4k 超采样已有项目，或初始化时以 4K
  画布创作。需满足宽高比、整数倍、MP4 等条件，并用 ffprobe 核对输出为 3840×2160。
contentId: capabilities-4k-rendering
kind: capability
sources:
  - official-docs-guides-4k-rendering
appliesTo: cli-agent；框架资料 v0.9.96；桌面版本另行确认
status: auto-checked
verification: 依据固定官方来源与独立模型核验；未执行登录、付费服务或桌面操作。
---
## 先选路径：直接以 4K 创作，还是渲染时放大

HyperFrames 提供两种得到 4K 结果的方式，适用场景不同。

第一种是**渲染时超采样**：项目仍按原尺寸（例如 1920×1080）排版，渲染时以更高的设备像素比捕获，输出 3840×2160 文件。合成布局不变，适合已有项目快速出 4K 版本。

第二种是**从创建起就用 4K 画布**：初始化项目时指定 4K 分辨率。当画布或 WebGL 代码、固定分辨率素材、布局决策需要在创作阶段就知道最终像素尺寸时，选这条路径。

## 渲染已有项目为 4K

在 CLI/Agent 入口执行：

```bash
npx hyperframes render --resolution 4k --output final-4k.mp4
```

竖屏或方形作品要换成对应预设：

| 预设 | 输出尺寸 |
| --- | --- |
| `4k` 或 `landscape-4k` | 3840×2160 |
| `portrait-4k` | 2160×3840 |
| `square-4k` | 2160×2160 |

## 从 4K 画布开始创作

```bash
npx hyperframes init my-video --resolution 4k
```

这样后续的布局与画布尺寸都以 4K 为基准，避免先按小尺寸设计、再靠放大补救。

## 哪些内容会真正变清晰

超采样不是把所有素材都变高清，效果取决于内容类型：

- HTML 文字、SVG、CSS 形状与渐变：会在 4K 下重新栅格化，通常更锐利。
- 高分辨率图片：能用上素材本身的细节。
- 1080p 图片和视频：只是被放大，不会产生新的源细节。
- `<canvas>` 与 WebGL：受画布固有尺寸限制。

因此，想要整体锐利的 4K 成片，应准备 4K 源素材，并把 canvas/WebGL 缓冲区按目标分辨率设置。

## 使用条件与限制

`--resolution` 只在以下条件同时满足时可用：

- 预设与合成宽高比一致；
- 目标尺寸是创作尺寸的整数倍；
- 目标不小于合成尺寸；
- 输出为 MP4，而非带透明通道的格式；
- 同一次渲染没有强制 HDR。

HyperFrames 会在打开浏览器前检查这些条件。若组合不受支持，先按合成原生尺寸渲染，再单独缩放。

## 检查输出文件

用 ffprobe 读取视频流尺寸：

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height final-4k.mp4
```

横屏 4K 应显示 `3840` 与 `2160`。这一步是确认结果的关键，不要只看文件名。

## 时间与资源预期

4K 的像素量是 1080p 的四倍，渲染时间、内存占用和输出体积都会上升。建议先用 `--quality draft` 出审阅版，确认内容后再按需要的质量正式渲染。

## 学习路径

1. 先读命令行渲染指南，熟悉 `render` 的基本用法。
2. 再看渲染性能指南，了解如何控制耗时与资源。
3. 若作品涉及高动态范围，另读 HDR 交付指南，注意它与 4K 渲染不能在同一次渲染中强制叠加。

以上步骤来自官方指南，未在本地实际执行；请以你环境中的实际输出为准。
