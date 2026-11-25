## 输入与目标

原创中文文案、步骤图与定时文字。本例画面为 960×540、30fps、8 秒。目标是演示一个清晰的小工作流，便于下载后修改。

## 制作过程

用三个步骤建立顺序，再在底部显示对应的解释文字，最后保持完整信息。先完成静态布局，再使用暂停的 GSAP 时间轴安排动作，并注册到根合成。

## 可以复用的提示词

> 制作一支 8 秒无配音中文讲解，把“写需求、看预览、改细节”分成三步。使用随项目附带的中文字体，每个重点留出阅读时间。

## 下载与复现

[下载完整项目 ZIP](/examples/chinese-explainer.zip)，解压后保留目录中的 HTML、GSAP、中文字体、配置与许可文件，即可独立检查和渲染。也可分别下载 [HTML 源码](/examples/chinese-explainer/index.html)、[GSAP](/examples/chinese-explainer/gsap.min.js)、[中文字体](/examples/chinese-explainer/font.ttf) 和 [字体许可](/examples/chinese-explainer/OFL.txt)。需要全部项目时，从本站 GitHub 下载仓库并查看 examples 目录。

~~~bash
npx hyperframes lint examples/chinese-explainer
npx hyperframes render examples/chinese-explainer --output chinese-explainer.mp4
~~~

完整 ZIP 已包含本例所需文件。批量复现四个案例的方法见仓库维护手册。

## 验证与边界

本例为无配音的信息动画，字幕按预设时间显示；没有进行语音识别或声画自动对齐。具体渲染版本、媒体信息和命令结果记录在 [案例验证记录](/examples/verification.json)，未验证步骤不会被标为成功。

## 继续修改

先修改一句文案或一项数值，重新检查布局并导出。确认画面变化后再调整时长与动画，避免同时修改太多因素。
