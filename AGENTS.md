# BandTwine 可视化编辑器开发规范 (AGENTS.md)

本文档为开发 BandTwine 可视化编辑器提供统一的开发规范和指导，确保代码质量、测试覆盖率和团队协作效率。

## 开发原则

### 1. 测试驱动开发 (TDD)
- **所有新功能必须从测试开始**
- 编写测试 → 实现功能 → 重构
- 测试覆盖率要求：核心业务逻辑 > 90%
- 使用 Vitest + Vue Testing Library 进行测试

### 2. 代码质量
- **TypeScript 严格模式**：所有新代码必须使用 TypeScript
- **代码风格一致性**：遵循项目现有代码风格
- **组件化设计**：单一职责，高内聚低耦合
- **注释规范**：复杂逻辑必须有注释，公共 API 必须有 JSDoc

### 3. Git 工作流
- **分支策略**：feature/*, bugfix/*, release/*
- **提交信息规范**：遵循 Conventional Commits
- **代码审查**：所有合并请求必须经过代码审查
- **提交前检查**：运行测试和类型检查
- **原子化提交**：
  - 每个提交应该只包含一个逻辑变更
  - 避免将多个不相关的变更放在同一个提交中
  - 功能开发应分解为小的、可测试的提交
  - 提交信息应清晰描述变更内容，格式：`类型(范围): 描述`
  - 常见类型：feat（新功能）、fix（错误修复）、docs（文档）、style（样式）、refactor（重构）、test（测试）、chore（维护）

## 技术栈规范

### 前端框架
- **Vue 3**：使用 Composition API
- **TypeScript**：严格模式启用
- **Vite**：构建工具

### 样式方案
- **Tailwind CSS v4+**：实用类优先
- **daisyUI**：组件库，遵循其主题系统
- **响应式设计**：移动端优先

### 状态管理
- **Pinia**：Vue 官方推荐的状态管理
- 状态设计原则：单一数据源，最小化状态

### 节点图编辑
- **Vue Flow**：专业的节点图库
- 自定义节点组件遵循 Vue Flow 最佳实践

### 测试框架
- **Vitest**：单元测试和组件测试
- **Vue Testing Library**：组件测试
- **JSDOM**：DOM 环境模拟

## 项目结构规范

```
visual-editor/
├── src/
│   ├── components/           # 可复用 UI 组件
│   │   ├── __tests__/       # 组件测试文件
│   │   └── *.vue            # Vue 组件
│   ├── composables/         # 组合式函数
│   ├── stores/              # Pinia 状态管理
│   │   ├── __tests__/       # Store 测试文件
│   │   └── *.ts             # Store 定义
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   │   ├── __tests__/       # 工具函数测试
│   │   └── *.ts             # 工具函数实现
│   ├── views/               # 页面组件（如有）
│   └── App.vue              # 根组件
├── tests/                   # 全局测试配置
│   ├── setup.ts            # 测试环境配置
│   └── *.spec.ts           # 全局测试文件
└── *.config.*              # 配置文件
```

## 测试规范

### 测试文件命名
- 单元测试：`*.spec.ts`
- 组件测试：`ComponentName.spec.ts`
- 测试文件与源文件同目录或位于 `__tests__` 子目录

### 测试编写指南
1. **描述性测试名称**：`describe('功能名称', () => { ... })`
2. **AAA 模式**：Arrange-Act-Assert
3. **最小化依赖**：使用模拟和桩
4. **边界条件测试**：异常情况和边界值

### 测试覆盖率要求
```bash
npm test -- --coverage
```
- 语句覆盖率 > 85%
- 分支覆盖率 > 80%
- 函数覆盖率 > 90%
- 行覆盖率 > 85%

## 代码审查清单

### 功能实现
- [ ] 符合需求规格
- [ ] 有相应的测试用例
- [ ] 处理了边界条件和错误情况
- [ ] 没有引入安全漏洞

### 代码质量
- [ ] 遵循 TypeScript 最佳实践
- [ ] 代码结构清晰，易于理解
- [ ] 没有重复代码
- [ ] 适当的注释和文档

### 性能考虑
- [ ] 没有内存泄漏风险
- [ ] 异步操作正确处理
- [ ] 组件渲染性能优化

### 可维护性
- [ ] 易于扩展和修改
- [ ] 清晰的模块边界
- [ ] 遵循单一职责原则

## 开发工作流

### 1. 需求分析
- 理解需求并拆解任务
- 设计数据结构和 API
- 编写测试用例设计

### 2. 实现阶段
```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 编写测试
npm test -- --watch

# 3. 实现功能
# 4. 运行测试确保通过
npm test

# 5. 类型检查
npm run type-check

# 6. 代码质量检查（如有）
# 7. 提交代码
git add .
git commit -m "feat: 描述变更"
```

### 3. 代码审查
- 创建合并请求
- 添加至少一名审查者
- 根据反馈进行修改
- 确保所有检查通过

### 4. 部署
- 合并到主分支
- 自动构建和测试
- 部署到测试环境
- 验证功能

## 常见任务规范

### 添加新组件
1. 在 `src/components/` 创建 `.vue` 文件
2. 编写组件测试文件
3. 实现组件功能
4. 在 App.vue 或父组件中集成

### 修改状态管理
1. 更新 `src/types/index.ts` 中的类型定义
2. 修改 `src/stores/editor.ts`
3. 更新对应的测试文件
4. 确保类型安全

### 添加工具函数
1. 在 `src/utils/` 创建 `.ts` 文件
2. 编写详细的 JSDoc 注释
3. 创建对应的测试文件
4. 导出函数

## 故障排除

### 常见问题
1. **Vue Flow 警告**：检查节点和边数据格式
2. **TypeScript 错误**：确保类型定义完整
3. **测试失败**：更新模拟数据或测试逻辑
4. **样式问题**：检查 Tailwind CSS 配置

### 调试工具
- Vue DevTools
- 浏览器开发者工具
- Vitest UI (`npm run test:ui`)

## 参考资源

### 文档
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vue Flow 文档](https://vueflow.dev/)
- [Vitest 文档](https://vitest.dev/)

### 项目相关
- `VISUAL_EDITOR_DEVELOPMENT.md` - 项目开发记录
- `visual-editor/README.md` - 项目使用说明
- `bandtwine_src/game-data.json` - 数据格式参考

---

*最后更新：2026-03-08*
*版本：1.0.0*