# BandTwine (结彩)

> 📌 **本项目是 [OrPudding/VelaOS_BandTwine](https://github.com/OrPudding/VelaOS_BandTwine) 的 Fork**，添加了可视化节点编辑器功能。

<div align="center">
  <img src="https://raw.githubusercontent.com/OrPudding/VelaOS_BandTwine/main/src/common/icon.png" alt="BandTwine Logo" width="150"/>
  <h1 align="center">BandTwine (结彩 )</h1>
  <p align="center">
    <strong>首个面向 RTOS 智能穿戴的 Twine 实现</strong>
  </p>
        <p>轻量化引擎 · 深度叙事 · 多设备适配</p>
  <p align="center">
    <a href="https://velaos-bandtwine.pages.dev/"><strong>📚 完整文档 »</strong></a>
    <span> · </span>
    <a href="visual-editor/README.md"><strong>🎨 可视化编辑器 »</strong></a>

  </p>
</div>

---

## 📖 简介

**BandTwine (结彩 )** 是一个开创性的互动小说引擎，它将强大的 [Twine](https://twinery.org/ ) 叙事能力带入了资源受限的 RTOS 智能穿戴设备中。我们的使命是让每一位创作者都能通过简单、高效的方式，为智能手表和手环等设备带来具有深度分支剧情的互动小说体验。

无论您是经验丰富的开发者，还是对编程一无所知的故事讲述者，BandTwine 都能为您提供释放创意的舞台。

## ✨ 核心亮点

*   🚀 **零代码开发**: 纯 JSON 构建分支剧情，任何文本编辑器都是您的开发环境。我们还提供可视化节点编辑器，让创作更直观。

*   ⌚️ **穿戴设备专属优化**: 内置时间系统、震动反馈、低功耗渲染和小屏交互优化，确保在手腕方寸之间也能获得流畅、沉浸的叙事体验。

*   🌐 **多设备全兼容**: 一次开发，多平台运行。完美适配小米手环、小米手表等主流设备，让您的作品触达更广泛的用户群体。

*   🔧 **丰富而强大的特性**: 从多层级变量、条件分支到随机系统和事件监听器，BandTwine 提供了接近完整 Twine 的功能集，足以支撑复杂的故事逻辑。

## 🚀 快速开始

想要立即开始您的创作之旅吗？我们为您提供两种创作方式：

### 方式一：可视化编辑器（推荐）

我们提供了基于 Web 的可视化节点编辑器，让创作更加直观：

```bash
cd visual-editor
npm install
npm run dev
```

然后访问 http://localhost:5175 即可使用。

**可视化编辑器功能：**
- 🎨 可视化节点图编辑（拖拽、连线）
- 📝 节点文本编辑（支持变量、条件、随机、图片标记）
- 🔧 动作系统（set/add/toggle/vibrate/toast/jump 等）
- 🎲 随机系统和条件分支
- 🖼️ 图片定义管理
- 📦 JSON 导入/导出
- 🌓 深色/浅色主题

### 方式二：手动编写 JSON

**➡️ 前往我们的官方文档网站：[BandTwine Docs](https://velaos-bandtwine.pages.dev/)**

在文档中，您会找到：
*   **快速上手教程**: 手把手带您创建第一个场景，添加选项，并实现简单的逻辑。
*   **深度指南**: 详细讲解变量、动作、条件、时间系统等每一个核心功能。
*   **API 参考**: 为开发者准备的详尽 API 列表。

## 📦 设备兼容性

| 设备型号 | 适配状态 | 备注 |
| :--- | :--- | :--- |
| 小米手环 10 | ✅ 完美适配 | |
| 小米手表 S4 / S3 | ✅ 完美适配 | |
| 小米手环 9 Pro | ✅ 完美适配 | |
| 小米手环 9 | ✅ 完美适配 | 需要指定`designWidth`为`212` |
| 小米手环 8 Pro | ✅ 完美适配 | 需要关闭`protobuf`打包 |
| 红米手表系列 | 🟡 适配中 | 即将支持 |

> 我们会持续更新此列表，也欢迎社区开发者贡献新的设备适配。

## 🤝 加入我们

我们相信开源的力量能够让 BandTwine 变得更好。无论您是开发者、创作者还是普通用户，都欢迎您的加入！

*   **QQ 交流群**: **1053559560**
    > 加入群聊，与开发者和其他用户直接交流，获取免费的技术指导和创作支持。

*   **GitHub 仓库**: [OrPudding/VelaOS_BandTwine](https://github.com/OrPudding/VelaOS_BandTwine )
    > 欢迎提交 Issue、发起 Pull Request，或者为项目点亮一个 ⭐ Star！

## ❤️ 支持项目

如果您觉得这个项目对您有帮助，可以考虑[捐赠](https://velaos-bandtwine.pages.dev/)支持我们，让项目能更长久地发展下去。您的每一份支持都是我们前进的动力！

## 📜 开源协议

引擎部分采用 **AGPLv3** 开源协议。我们鼓励共建开源世界。

您创作的**内容部分**（如 `data.json` 中的剧情、美术资源等）**可以采用任何您喜欢的协议**，包括闭源商用。

> **重要声明**: 本项目作者保留所有权利。禁止在您发布的游戏中删除“关于页”底部的任何声明。
