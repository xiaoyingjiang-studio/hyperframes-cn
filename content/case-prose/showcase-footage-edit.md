## 输入与目标

本站产品介绍原创 MP4 片段与新建字幕叠加层。本例画面为 960×540、30fps、8 秒。目标是演示一个清晰的小工作流，便于下载后修改。

## 制作过程

把自产视频作为项目的媒体轨道，再叠加时间明确的文字和外框，重新渲染成片。先完成静态布局，再使用暂停的 GSAP 时间轴安排动作，并注册到根合成。

## 可以复用的提示词

> 使用本站已有的产品介绍片段制作 8 秒短片，保留原画面主体，加入“已有素材”和“继续编辑”的中文标签，不生成新的外部素材。

## 下载与复现

[下载完整项目 ZIP](/examples/footage-edit.zip)，解压后保留目录中的 HTML、GSAP、中文字体、配置与许可文件，即可独立检查和渲染。也可分别下载 [HTML 源码](/examples/footage-edit/index.html)、[GSAP](/examples/footage-edit/gsap.min.js)、[中文字体](/examples/footage-edit/font.ttf) 和 [字体许可](/examples/footage-edit/OFL.txt)。需要全部项目时，从本站 GitHub 下载仓库并查看 examples 目录。

~~~bash
npx hyperframes lint examples/footage-edit
npx hyperframes render examples/footage-edit --output footage-edit.mp4
~~~

完整 ZIP 已包含本站自产的 product-intro.mp4，请与 HTML 保持同一目录。完整批量复现流程见仓库维护手册。

## 验证与边界

本例素材为本站自产视频，静音处理，不声称还原原片里的所有元素为可编辑图层。具体渲染版本、媒体信息和命令结果记录在 [案例验证记录](/examples/verification.json)，未验证步骤不会被标为成功。

## 继续修改

先修改一句文案或一项数值，重新检查布局并导出。确认画面变化后再调整时长与动画，避免同时修改太多因素。
