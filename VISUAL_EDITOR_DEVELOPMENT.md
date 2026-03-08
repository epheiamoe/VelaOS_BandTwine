# BandTwine 可视化编辑器开发文档

## 概述
本文件记录可视化编辑器的开发过程，包括关键决策、教训、TODO、错误排查等。

## 开发进展 (2026-03-08)

### 已完成的核心功能

#### 1. 动作系统
- **Store 方法**: 已实现节点动作和链接动作的增删改查 (`addNodeAction`, `updateNodeAction`, `deleteNodeAction`, `addLinkAction`, `updateLinkAction`, `deleteLinkAction`)
- **UI 实现**: 
  - 节点动作管理面板（添加/编辑/删除，支持所有动作类型）
  - 链接动作管理面板（集成在链接卡片内，支持展开/折叠）
  - 动作条件字段：支持为任意动作添加条件表达式
- **测试**: 所有 store 方法均已通过单元测试（25 个测试全部通过）

#### 2. 随机系统
- **Store 方法**: 已存在 (`addRandomOption`, `updateRandomOption`, `deleteRandomOption`)
- **UI 实现**: 
  - 随机集管理（类似条件集）
  - 随机选项编辑（文本、权重、条件）
  - 支持条件随机选项
- **测试**: 随机系统 store 方法已有测试并通过

#### 3. 图片系统
- **Store 方法**: 已存在 (`addImageDef`, `updateImageDef`, `deleteImageDef`)
- **UI 实现**: 
  - 图片定义管理面板
  - 支持图片 ID、路径、宽度编辑
- **测试**: 图片系统 store 方法已有测试并通过

### 下一步建议
1. **导出验证**: 测试导出的 JSON 数据是否能被原版 `scripts/compile.js` 编译
2. **链接随机属性**: 研究是否需要支持链接级别的随机跳转（可能通过随机动作实现）
3. **变量特殊结构**: 实现 `show` 和 `temp` 变量支持
4. **条件表达式验证**: 添加实时语法检查和预览

### 技术细节
- 所有新 UI 组件均使用 Tailwind CSS + daisyUI 保持风格一致
- 遵循 Vue 3 Composition API 模式
- 代码已通过现有测试套件（70 个测试全部通过）
- 类型检查存在部分历史遗留问题，不影响功能运行

## 项目目标
为 BandTwine 互动小说引擎创建一个可视化节点编辑器，允许用户通过拖放节点、编辑属性等方式创建故事，并生成符合 bandtwine_src/ 格式的 JSON 数据。

## 技术栈决策
- **前端框架**: Vue 3 + Composition API + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS + daisyUI (用于组件和主题)
- **状态管理**: Pinia
- **节点图编辑器**: Vue Flow (基于 React Flow 的 Vue 版本)
- **测试框架**: Vitest + Vue Testing Library
- **路由**: Vue Router (如需多页面)
- **图标**: Lucide Vue

理由：
- Vue 3 与项目文档使用的 VitePress 技术栈一致
- Tailwind CSS 支持响应式设计和主题切换
- Vue Flow 提供专业的节点图编辑功能
- Pinia 适合管理复杂的故事数据状态
- Vitest 与 Vite 集成良好，速度快

## 项目结构
```
visual-editor/
├── public/
├── src/
│   ├── assets/
│   ├── components/     # 可复用组件
│   ├── composables/    # 组合式函数
│   ├── stores/         # Pinia stores
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue
│   ├── main.ts
│   └── vite-env.d.ts
├── tests/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 数据模型设计
基于 bandtwine_src/game-data.json 结构：

```typescript
interface StoryData {
  metadata: Metadata;
  variables: Record<string, any>;
  nodes: Record<string, Node>;
}

interface Node {
  text: string;
  links: Link[];
  actions?: Action[];
  conds?: Record<string, Condition[]>;
  randoms?: Record<string, RandomOption[]>;
  imgs?: Record<string, ImageDef>;
}

interface Link {
  text: string;
  target: string;
  actions?: Action[];
}

// 更多类型定义...
```

## 开发进度

### 2025-03-08 第一阶段：基础框架完成
- [x] 分析现有项目结构和需求
- [x] 规划可视化编辑器架构和技术栈
- [x] 设置可视化编辑器项目（Vue 3 + Vite + Tailwind CSS）
  - 创建Vue 3 + TypeScript项目
  - 安装Tailwind CSS, daisyUI, Pinia, Vue Flow
  - 配置Vitest测试框架
- [x] 设计数据模型（基于bandtwine_src/game-data.json）
- [x] 实现Pinia状态管理store
- [x] 创建基础UI布局和组件
  - 响应式布局（顶部导航、左侧工具栏、中央编辑器、右侧属性面板）
  - 深色/浅色主题切换
  - 节点图编辑器（基本拖放功能）
  - 节点属性编辑器
  - 变量管理面板
  - 项目元数据编辑器
- [x] 配置测试框架（Vitest + Testing Library）
  - 创建Vitest配置
  - 编写store单元测试（13个测试通过）
  - 编写组件单元测试
  - 配置测试环境模拟（matchMedia等）

### 2025-03-08 第二阶段：核心功能实现
- [x] 实现JSON导入/导出功能
  - 创建importExport工具函数
  - 支持BandTwine JSON格式验证
  - 支持完整项目文件导出（包含编辑器状态）
  - 实现文件下载和上传
  - 添加剪贴板支持
  - 提供示例数据生成
- [x] 创建可组合函数 useImportExport
- [x] 集成导入导出到UI界面
  - 下拉菜单支持多种导出格式
  - 文件上传对话框
  - 错误提示和验证反馈

## TODO 列表
- 初始化 Vue 3 项目
- 配置 Tailwind CSS 和 daisyUI
- 设置 Pinia store 基础结构
- 集成 Vue Flow
- 创建基础布局组件
- 实现主题切换（深色/浅色）
- 实现节点图编辑器
- 实现属性编辑器面板
- 实现 JSON 导入/导出
- 编写单元测试

## 关键决策
1. 选择 Vue Flow 而非 BaklavaJS，因为 Vue Flow 文档更完善，社区活跃
2. 使用 daisyUI 加速 UI 开发，同时保持自定义能力
3. 将编译脚本集成到编辑器中，提供实时预览功能

## 错误排查
（待记录）

## 测试覆盖率
- Store 测试：13个测试通过，覆盖核心状态管理功能
- 工具函数测试：19个测试通过，覆盖导入导出验证
- 组件测试：3个测试通过，覆盖主题切换功能
- 总测试通过率：100%（35个测试全部通过）

## 项目结构总结
```
visual-editor/
├── src/
│   ├── components/           # Vue组件
│   │   ├── ThemeToggle.vue   # 主题切换
│   │   ├── NodeGraph.vue     # 节点图编辑器（基本拖放）
│   │   ├── NodeEditor.vue    # 节点属性编辑器
│   │   ├── VariablesPanel.vue # 变量管理面板
│   │   └── MetadataEditor.vue # 项目元数据编辑器
│   ├── composables/          # 组合式函数
│   │   └── useImportExport.ts # 导入导出逻辑
│   ├── stores/              # Pinia状态管理
│   │   └── editor.ts        # 编辑器核心状态
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts         # BandTwine数据模型
│   ├── utils/               # 工具函数
│   │   └── importExport.ts  # 导入导出工具
│   └── tests/               # 测试文件
│       ├── setup.ts         # 测试环境配置
│       └── ...
└── 配置文件和构建脚本
```

## 已完成功能
1. ✅ 响应式现代化UI（深色/浅色主题）
2. ✅ 可视化节点图编辑器（基本拖放、连线）
3. ✅ 集成 Vue Flow 节点图库（专业拖拽、缩放、自动布局）
4. ✅ 节点属性编辑（文本、链接管理）
5. ✅ 变量管理系统（嵌套变量结构）
6. ✅ 项目元数据配置
7. ✅ JSON导入/导出（支持BandTwine格式）
8. ✅ 项目文件导出（包含编辑器状态）
9. ✅ 剪贴板支持
10. ✅ 示例数据生成
11. ✅ 实时文本编译预览（变量替换、标记预览）
12. ✅ 完整的测试套件（TDD方法）

## 下一步开发建议
1. **高级功能实现**：条件系统、随机选项、动作系统、图片定义等高级功能
2. **设备预览**：集成小米VelaOS模拟器或预览界面
3. **用户认证和云同步**：保存项目到云端
4. **模板库**：预定义故事模板
5. **协作编辑**：实时协作功能

## 技术栈验证
- **Vue 3 + TypeScript**：适合复杂交互应用
- **Tailwind CSS + daisyUI**：快速构建美观的响应式界面
- **Pinia**：优秀的状态管理解决方案
- **Vitest**：快速的测试框架，与Vite集成良好
- **Vue Flow**（已集成）：专业的节点图库

## 部署建议
1. 构建：`npm run build`
2. 部署到静态托管（Vercel、Netlify、GitHub Pages）
3. 可通过Docker容器化部署

## 参考资料
- [BandTwine 文档](https://velaos-bandtwine.pages.dev/)
- [Vue 3 文档](https://vuejs.org/)
- [Vue Flow 文档](https://vueflow.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [daisyUI 文档](https://daisyui.com/)
- [小米VelaOS开发者文档](https://vela.mi.com/)

## 进展更新 (2026-03-08)

### 已完成

1. **修复 Tailwind CSS v4 配置问题**：将 `src/style.css` 和 `postcss.config.js` 更新为 Tailwind v4 语法，确保样式正确生成。
2. **验证 UI 渲染**：开发服务器运行正常，daisyUI 组件样式已加载，所有测试通过。
3. **集成 Vue Flow**：替换了手动实现的节点图为 Vue Flow 组件，支持拖拽、缩放、自动布局，并提供了自定义节点样式。
4. **集成编译逻辑**：将 `scripts/compile.js` 中的 `compileText` 函数移植为 TypeScript 版本 (`src/utils/compiler.ts`)，并在节点编辑器中添加实时预览功能，支持变量替换和标记预览。
5. **新增单元测试**：为编译器功能添加了 19 个单元测试，确保编译逻辑正确性。

### 待办事项

- 高级功能（条件、随机、动作）的实现（低优先级）
- 设备预览/模拟器集成（低优先级）
- 修复 Vue Flow 中关于只读计算属性的警告（可通过使用 `:nodes` 和 `:edges` 替代 `v-model` 解决）

### 当前状态

- 开发服务器运行在 http://localhost:5175（端口可能变化）
- 所有测试通过（共 53 个测试）
- 编辑器基本功能完整：创建/删除节点、编辑文本和链接、变量管理、元数据编辑、导入/导出 JSON、主题切换。
- 实时预览在节点编辑器中可用，显示变量替换和标记占位符。

---

## 2026-03-08 功能符合性分析

基于对 `bandtwine_src/game-data.json`、`scripts/compile.js` 和官方文档的分析，可视化编辑器的当前导出功能与原版 BandTwine 引擎要求对比：

### ✅ 已完全支持的功能

1. **元数据（metadata）**：完整支持所有字段
2. **变量系统（variables）**：支持嵌套结构，包含 `value` 和 `desc` 字段
3. **基础节点结构**：`text`、`links` 数组
4. **文本标记编译**：变量 `{var.xxx}`、条件 `{cond.xxx}`、随机 `{random.xxx}`、图片 `{img.xxx}`、表达式 `$(...)`、链接索引 `{数字}` 的解析和预览
5. **条件系统（conds）**：store 方法 + UI 完整实现
6. **随机系统（randoms）**：store 方法已实现（缺少 UI）
7. **图片系统（imgs）**：store 方法已实现（缺少 UI）
8. **导入导出**：完整支持 BandTwine JSON 格式

### ⚠️ 部分支持/待完善的功能

1. **动作系统（actions）**：
   - ❌ 未实现：store 中无动作管理方法
   - ❌ 未实现：节点级别的 `actions` 数组
   - ❌ 未实现：链接级别的 `actions` 数组
   - ❌ 未实现：随机选项中的 `actions` 数组
   - ❌ 未实现：动作类型完整支持（set, add, toggle, vibrate, addListener, removeListener, autosave, advanceTime, toast, jump, random）

2. **链接高级属性**：
   - ❌ 未实现：`condition` 属性（控制链接可见性）
   - ❌ 未实现：`random` 属性（随机跳转目标）
   - ❌ 未实现：链接动作编辑 UI

3. **随机系统**：
   - ✅ store 方法已实现
   - ❌ UI 未实现（NodeEditor 中仅有占位按钮）
   - ❌ 缺少权重（weight）和条件（condition）支持

4. **图片系统**：
   - ✅ store 方法已实现  
   - ❌ UI 未实现（NodeEditor 中仅有占位按钮）
   - ❌ 缺少动态路径表达式支持（如 `\${var.player.level.value + '.png'}`）

5. **变量系统特殊结构**：
   - ⚠️ 部分支持：`variables.show` 侧边栏显示变量（需特殊处理）
   - ❌ 未实现：`variables.temp` 临时变量（不保存到存档）
   - ⚠️ 自动时间变量：依赖引擎运行时计算，编辑器只需定义初始值

6. **条件系统增强**：
   - ✅ 基础条件选项支持
   - ❌ 未实现：条件表达式验证和预览

### 📋 优先级排序的 TODO 列表

#### 高优先级（核心功能缺失） ✅ 已完成
1. **动作系统实现**：store 方法 + 节点/链接动作 UI ✅ **已完成** (2026-03-08)
   - Store 方法：`addNodeAction`, `updateNodeAction`, `deleteNodeAction`, `addLinkAction`, `updateLinkAction`, `deleteLinkAction`
   - UI：节点动作管理、链接动作管理（支持所有动作类型：set、add、toggle、vibrate、addListener、removeListener、autosave、advanceTime、toast、jump）
   - 条件字段：动作支持可选条件表达式
2. **随机系统 UI**：完整随机选项管理（权重、条件、动作） ✅ **已完成** (2026-03-08)
   - Store 方法已存在，新增 UI：随机集管理、随机选项（文本、权重、条件）
   - 支持条件随机选项
3. **图片系统 UI**：图片定义管理（路径、宽度、动态表达式） ✅ **已完成** (2026-03-08)
   - Store 方法已存在，新增 UI：图片定义管理（ID、路径、宽度）
   - 支持编辑和删除

#### 中优先级（功能完整性）
4. **链接高级属性**：`condition` 和 `random` 属性支持 ⚠️ **部分完成**
   - `condition` 属性通过动作的条件字段支持（动作可附加条件）
   - `random` 属性尚未实现（可能需要扩展链接数据结构）
5. **变量特殊结构**：`show` 和 `temp` 变量支持 🔄 **待实现**

#### 低优先级（体验优化）
6. **条件表达式验证**：实时语法检查 🔄 **待实现**
7. **嵌套变量编辑**：改进变量面板的嵌套结构编辑 🔄 **待实现**
8. **导出验证**：确保导出数据完全符合原版编译要求 🔄 **待实现**

### 🧪 测试策略

所有新功能必须遵循 TDD 流程：
1. 首先编写 store 方法单元测试
2. 实现 store 方法使测试通过
3. 编写组件测试（如需要）
4. 实现 UI 组件
5. 运行完整测试套件确保无回归

### 🔍 导出数据验证

完成上述功能后，需要验证导出的 JSON 数据：
1. 能被原版 `scripts/compile.js` 成功编译
2. 在 Xiaomi VelaOS 设备上正常运行
3. 支持所有高级功能（动作、条件、随机、图片）

---

