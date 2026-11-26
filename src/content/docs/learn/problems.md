---
title: 问题与限制总览
description: >-
  先把现象放到正确阶段：连接、项目、画面时间、声音或输出。保留入口、版本、步骤、时刻与实际提示，再选择对应指南；保护已经正确的修改，修复后验证相关流程与最终文件。
contentId: learn-problems
kind: catalog
sources:
  - help
  - developers-cli
  - guides-performance
  - guides-captions-and-recuts
  - prompting-captions-catalog
  - quickstart
appliesTo: 本站学习导航；各能力以所链接文章的适用入口为准
status: source-based
verification: 本站编排的学习路径，来源沿用所引文章的固定资料；未在本轮执行桌面登录、Agent 创作或付费服务。
---
排查先从实际现象出发：是任务没有启动、项目没有显示、某个时刻画面不对，还是输出文件有问题？把问题放到正确阶段，通常比重复生成整段视频更容易定位。

这里连接常见问题与对应方法，不承诺一个动作可以修复所有环境。

## 先保留能够说明问题的信息

记下当前入口、操作系统、应用或 CLI 版本、刚才做了什么，以及实际报错。画面问题还应记下场景与时间，必要时保留截图。记录“第五秒字幕被产品图挡住”，比“字幕不好用”更便于继续处理。

尽量先保护已经正确的内容。若一轮修改让结果变差，先确认能否恢复，再缩小任务范围。

## 按现象选择检查入口

| 现象 | 先读哪里 | 先区分什么 |
| --- | --- | --- |
| 中文字形、换行或字体不对 | [中文排版](/guides/chinese-typography/) | 字体来源、布局与实际输出 |
| Windows 安装或运行异常 | [Windows 指南](/guides/windows/) | 当前工具与环境条件 |
| Agent 没有正常开始任务 | [连接 Agent](/studio/connect-your-agent/) | 安装、登录与媒体服务条件 |
| 修改没有落在指定地方 | [定位修改](/mechanisms/targeted-edits/) | 对象、时刻与要求是否清楚 |
| 预览和成片不一致 | [预览与导出](/mechanisms/preview-and-export/) | 项目状态、定位状态和输出文件 |
| 声音或字幕不协调 | [音频与字幕](/mechanisms/audio-and-captions/) | 剪辑版本、文本与声音层次 |

## 没有报错也可能还有问题

自动检查只能覆盖它实际检查的范围；未执行、跳过或没有样本，不等于已经通过。画面是否讲清楚、音乐是否盖住旁白、文字能否读完，还需要看作品和听实际文件。范围说明见 [自动检查的边界](/mechanisms/checks/)。

具体情况先使用 [综合排查指南](/guides/troubleshooting/)，修改失败后看 [保留修改与恢复](/mechanisms/history/)。问题解决后再走一次相关流程，避免只修一个症状却漏掉最终输出。
