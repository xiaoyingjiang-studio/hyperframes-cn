## 输入与目标

HTML、文字、CSS 概念界面与 GSAP。本例画面为 960×540、30fps、8 秒。目标是演示一个清晰的小工作流，便于下载后修改。

## 制作过程

标题进入后展现原创概念界面，再以可编辑与导出的关系收尾。先完成静态布局，再使用暂停的 GSAP 时间轴安排动作，并注册到根合成。

## 可以复用的提示词

> 制作一支 8 秒中文产品介绍，依次呈现想法、可编辑项目、视频输出。不要伪造真实产品截图，界面注明概念演示。

## 下载与复现

[下载完整项目 ZIP](/examples/product-intro.zip)，解压后保留目录中的 HTML、GSAP、中文字体、配置与许可文件，即可独立检查和渲染。也可分别下载 [HTML 源码](/examples/product-intro/index.html)、[GSAP](/examples/product-intro/gsap.min.js)、[中文字体](/examples/product-intro/font.ttf) 和 [字体许可](/examples/product-intro/OFL.txt)。需要全部项目时，从本站 GitHub 下载仓库并查看 examples 目录。

~~~bash
npx hyperframes lint examples/product-intro
npx hyperframes render examples/product-intro --output product-intro.mp4
~~~

完整 ZIP 已包含本例所需文件。批量复现四个案例的方法见仓库维护手册。

## 验证与边界

没有抓取真实网页或调用品牌接口。画面中的编辑窗口为本站原创示意，重点是信息层级与动画。具体渲染版本、媒体信息和命令结果记录在 [案例验证记录](/examples/verification.json)，未验证步骤不会被标为成功。

## 继续修改

先修改一句文案或一项数值，重新检查布局并导出。确认画面变化后再调整时长与动画，避免同时修改太多因素。
