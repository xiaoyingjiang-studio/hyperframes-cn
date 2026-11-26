# 第三方归属

## HyperFrames

上游：https://github.com/heygen-com/hyperframes

版权归 HeyGen 及各贡献者。上游采用 Apache-2.0。本仓库 .upstream/snapshots 保存来源审查使用的原始资料，快照带固定提交与原路径，保留原始声明。本站页面通过来源链接标明改写依据。源码工程脚手架由 hyperframes 0.9.92 初始化。

## Studio 官方演示素材

首页的 `public/media/studio-first-video.mp4` 来自 HeyGen 官方文档所链接的 [Studio 首次创作演示](https://hyperframes.heygen.com/studio-app/first-video)，版权与原始权利归 HeyGen 及相关权利人，不纳入本站原创文字与原创案例的 CC BY 4.0 授权。

- 固定文档依据：[first-video.mdx @ dcdb181896f133cb36b0ba899999361fe4da325e](https://github.com/heygen-com/hyperframes/blob/dcdb181896f133cb36b0ba899999361fe4da325e/docs/studio-app/first-video.mdx)。沿用已有来源基线，未更新审核日期。
- 视频原址：`https://static.heygen.ai/hyperframes-oss/docs/studio-demos/first-video-demo-v2.mp4`。视频原样保存，SHA-256：`991a2a10c0e6026dccb936e9ce518e69e7f779476f3450df821109571780af3e`。
- `public/media/studio-first-video.jpg` 是该录屏的第 0 秒画面，等比缩小到 1280 × 800，未改动界面内容。SHA-256：`ba1af237e1580c2e4f7911aebbc38be570343949306ea057a176a12f65047a1d`。
- 原始录屏约 55 秒、无音轨，官方已加速等待过程；不代表实际生成耗时。使用 Claude Code 的录屏不表示本站已实操该流程。
- 上游仓库的原始 Apache-2.0 许可副本保存在 `public/media/hyperframes-LICENSE.txt`，素材来源与归属另随 `public/media/studio-official-notice.txt` 发布。第三方权利与商标归属保持不变。

首页另使用官方 Studio 绘制修改与导出截图、首次创作录屏第 35 秒的分镜画面，以及官方 HyperFrames 灵感选集的四张作品画面。来源固定到同一提交 `dcdb181896f133cb36b0ba899999361fe4da325e` 的 `docs/studio-app/edit-with-the-agent.mdx`、`docs/studio-app/export.mdx`、`docs/snippets/docs-video.jsx`。Studio 图片原样保存；录屏与作品抽帧仅等比缩放和 JPEG 压缩；漫画官方封面仅重新压缩。各文件的原始地址、抽帧时间、修改范围和 SHA-256 见 [素材归属清单](public/media/studio-official-notice.txt)。作品视频保留官方 CDN 地址，用户点击后才加载；不把官方 HyperFrames 作品宣称为本站 Studio 实操。原始权利、许可与商标归属保持不变。

## GSAP


上游：https://gsap.com/

示例中分发 gsap 3.15.1 的压缩文件，文件头版权声明保持完整。GSAP 的许可独立于本站 Apache-2.0。该 npm 包没有随附独立的完整许可文件，examples/shared/GSAP-LICENSE.txt 保存原始声明和条款地址，不替代原始条款。

## Noto Sans SC

字体项目：https://github.com/google/fonts/tree/main/ofl/notosanssc

首页另使用 Noto Sans SC 可变字体子集 `public/fonts/studio-sans.woff2`，原始字体来自本机已安装的 `NotoSansSC-VF.ttf`（SHA-256：`763146584cf0710223441356b4395e279021b0806c196614377a7a0174ae074a`），保留 100–900 字重轴。生成脚本为 `scripts/subset-studio-font.py`，只保留首页与公共组件所需字形并压缩为 WOFF2；SIL OFL 原文随 `public/fonts/OFL.txt` 分发。不使用外部字体 CDN，不改变原许可。

案例使用 Google Fonts 提供的 Noto Sans SC 字形子集；仅覆盖示例所需字符，字体项目采用 SIL Open Font License 1.1。每个可下载项目附 OFL.txt。字体通过 Google 官方端点在准备阶段下载，网站和渲染时均从本地加载。

## 原创媒体

网站 favicon 来自用户提供的产品图标，原图保存在 `assets/brand/product-icon-original.png`，转换范围与再生成方式见 [图标资产说明](assets/brand/README.md)。原图含生成标记并原样保留；派生 ICO 仅裁切留白与缩放。这是本站社区标识，不是 HeyGen 官方素材；本次网站使用不构成其他用途的新增授权。

product-intro、chinese-explainer、data-story 与 footage-edit 的文字、图形、概念界面、示例数字和自产视频由本项目制作。无外部人物素材或音乐。原始项目与实际执行记录在 examples 与 public/examples/verification.json。

Astro、Starlight、Pagefind、TypeScript、Wrangler、Playwright 等依赖通过包管理器安装，各自遵循包内许可，不随本站许可重新授权。
