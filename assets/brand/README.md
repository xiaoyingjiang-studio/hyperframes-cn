# 网站图标资产

`product-icon-original.png` 是用户于 2026-11-26 提供的产品图标原图（1536 × 1536），从「产品设计两个ICON (1).png」原样复制，保留原图及其生成标记。它用于本站社区品牌标识，不是 HeyGen / HyperFrames 官方标识。

HyperFrames 社区入口与 Starlight 知识库共用 `public/favicon.ico`。转换仅裁切原图的 `(154, 146, 1382, 1374)` 正方形区域，保留完整图形、渐变与背景，再缩放成 16、24、32、48、64、128、256 像素七种尺寸；未重绘图形。

## 小影匠工作室首页

`public-studio/xiaoyingjiang-icon.png` 是取景框与播放符号组成的独立工作室图标。`public-studio/media/xiaoyingjiang-creator.webp` 与 `public-studio/media/xiaoyingjiang-creator-mobile.webp` 来自同一张内置 ImageGen 生成图，分别编码为 1440 × 960 和 768 × 512。用于首页和手册的创作场景插图。用于生成的提示如下。

> One full-bleed landscape 3:2 photograph for the homepage of a premium Chinese studio helping faceless YouTube content creators reach new audiences. Editorial black and white film photography, neutral grayscale, delicate grain, sophisticated high contrast with plenty of readable highlight detail. Unmistakably FACELESS creation: the subject is only an anonymous adult's right hand with a matte black stylus and partial charcoal shirt sleeve entering naturally from the lower right, no person or face anywhere. Over-the-shoulder style close-up of an elegant black desk, with a large slim pen display positioned diagonally through the central middle foreground. The active near-white display clearly shows a simple ORIGINAL hand-drawn storyboard with three large editorial sketches about saving money: a wallet, a coin rolling down a sloped ramp with movement lines, and three ascending column shapes. Loose expressive single-weight black pen lines, not copying any existing channel art, no words, no letters, no readable UI, no brands. A handsome, visible broadcast microphone on a short boom enters from left foreground in upper left third, there is a low dark audio console with subtle levels near the far upper right and diffuse side-window light on the desk. Strong photographic contrast between the lit hand and pen-display and the deep black surroundings, minimal objects with intentional negative space, angled immersive view, artistic realism, frame the pen display, hand and microphone as the focus. No arrows with text, no graphic overlay, no collage, no faces, no heads, no reflection of a person, no numbers. Key creative work positioned near center to remain visible in 4:3 crop. This is a conceptual editorial photograph demonstrating a workflow, not a specific real workspace.

安装 Pillow 后，可在仓库根目录重新生成：

```sh
python scripts/generate-favicon.py
```

原图在构建目录之外保存，避免作为页面资源下载。提供者授权本次网站使用；本说明不新增其他用途的许可。
