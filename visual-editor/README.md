# BandTwine 可视化编辑器

基于 Vue 3 的 BandTwine 可视化节点编辑器，用于创建和编辑小米VelaOS智能穿戴设备的互动小说。

## 功能特性

- 🎨 **现代化响应式界面**：支持深色/浅色主题切换
- 📊 **可视化节点编辑**：拖放节点、连线创建故事分支
- 📝 **完整属性编辑**：节点文本、链接、变量、元数据编辑
- 📁 **导入导出**：支持 BandTwine JSON 格式和完整项目文件
- 🧪 **测试覆盖**：使用 Vitest 和 Vue Testing Library 进行 TDD 开发
- 🚀 **实时预览**：基础节点图实时渲染

## 技术栈

- **Vue 3** + **TypeScript** + **Composition API**
- **Vite** - 构建工具
- **Tailwind CSS** + **daisyUI** - 样式框架
- **Pinia** - 状态管理
- **Vue Flow** - 节点图库（基础集成）
- **Vitest** + **Testing Library** - 测试框架

## 快速开始

### 安装依赖
```bash
cd visual-editor
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 构建
```bash
npm run build
```

### 测试
```bash
npm test
# 或带UI的测试
npm run test:ui
# 覆盖率报告
npm run test:coverage
```

## 项目结构

```
visual-editor/
├── src/
│   ├── components/           # Vue组件
│   │   ├── ThemeToggle.vue   # 主题切换
│   │   ├── NodeGraph.vue     # 节点图编辑器
│   │   ├── NodeEditor.vue    # 节点属性编辑器
│   │   ├── VariablesPanel.vue # 变量管理
│   │   └── MetadataEditor.vue # 元数据编辑器
│   ├── composables/          # 组合式函数
│   ├── stores/               # Pinia状态管理
│   ├── types/                # TypeScript类型
│   ├── utils/                # 工具函数
│   └── tests/                # 测试文件
├── public/
└── 配置文件
```

## 使用指南

### 1. 创建新节点
- 点击左侧工具栏的"添加节点"按钮
- 在节点图中拖动节点调整位置
- 点击节点进行选择

### 2. 编辑节点属性
- 选择节点后，右侧面板显示属性编辑器
- 编辑节点文本内容
- 添加/编辑链接到其他节点

### 3. 管理变量
- 切换到"变量管理"标签页
- 添加嵌套变量结构
- 在节点文本中使用 `{var.path}` 引用变量

### 4. 项目设置
- 切换到"项目设置"标签页
- 编辑故事元数据（标题、作者、版本等）
- 设置起始节点

### 5. 导入导出
- **导出为JSON**：生成 BandTwine 兼容的 JSON 文件
- **导出项目**：包含编辑器状态的完整项目文件
- **导入文件**：支持 JSON 和 .bandtwine 项目文件
- **剪贴板操作**：复制/粘贴数据
- **示例数据**：快速加载示例故事

## 数据格式

编辑器使用 BandTwine 标准 JSON 格式：

```json
{
  "metadata": {
    "title": "故事标题",
    "author": "作者",
    "version": "1.0.0",
    "indexNode": "start"
  },
  "variables": {
    "player": {
      "name": { "value": "玩家" }
    }
  },
  "nodes": {
    "start": {
      "text": "起始文本",
      "links": [
        { "text": "选项1", "target": "node1" }
      ]
    }
  }
}
```

## 开发说明

### 遵循 TDD 方法
- 所有核心功能都有对应测试
- 测试覆盖率 100%
- 开发文档记录关键决策和进度

### 代码规范
- 使用 TypeScript 严格类型检查
- ESLint + Prettier 代码格式化
- 组件使用 Composition API

## 后续开发计划

1. **Vue Flow 完全集成**：增强节点图功能
2. **编译脚本集成**：实时预览编译结果
3. **高级功能**：条件系统、随机选项、动作系统
4. **设备预览**：小米VelaOS模拟器集成
5. **云同步**：项目保存到云端

## 许可证

本项目基于 BandTwine 项目的 AGPLv3 许可证。

## 相关链接

- [BandTwine 主项目](https://github.com/OrPudding/VelaOS_BandTwine)
- [BandTwine 文档](https://velaos-bandtwine.pages.dev/) - 包含可视化编辑器使用指南
- [小米VelaOS开发者平台](https://vela.mi.com/)
- [可视化编辑器快速入门](/docs/visual-editor-quick-start.md)
- [可视化编辑器完整指南](/docs/visual-editor-guide.md)
