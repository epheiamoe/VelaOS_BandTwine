<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useImportExport } from '@/composables/useImportExport'
import ThemeToggle from '@/components/ThemeToggle.vue'
import NodeGraph from '@/components/NodeGraph.vue'
import NodeEditor from '@/components/NodeEditor.vue'
import VariablesPanel from '@/components/VariablesPanel.vue'
import MetadataEditor from '@/components/MetadataEditor.vue'

const editorStore = useEditorStore()
const activeTab = ref<'nodes' | 'variables' | 'metadata'>('nodes')

// 面板显示状态
const showLeftPanel = ref(true)
const showRightPanel = ref(true)

// 从localStorage加载面板状态
onMounted(() => {
  const savedPanels = localStorage.getItem('bandtwine-editor-panels')
  if (savedPanels) {
    try {
      const panels = JSON.parse(savedPanels)
      if (typeof panels.left !== 'undefined') showLeftPanel.value = panels.left
      if (typeof panels.right !== 'undefined') showRightPanel.value = panels.right
    } catch (e) {
      console.warn('Failed to parse saved panel state:', e)
    }
  }
})

// 保存面板状态到localStorage
watch([showLeftPanel, showRightPanel], ([left, right]) => {
  const panels = { left, right }
  localStorage.setItem('bandtwine-editor-panels', JSON.stringify(panels))
})

const {
  exportAsJSON,
  exportProject,
  handleFileUpload,
  loadSampleData,
  copyToClipboard,
  importFromClipboard,
  errorMessage
} = useImportExport()
</script>

<template>
  <div class="min-h-screen bg-base-100 text-base-content">
    <!-- 顶部导航栏 -->
    <nav class="navbar bg-base-200 shadow-lg">
      <div class="navbar-start">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">B</span>
          </div>
          <h1 class="text-xl font-bold">BandTwine 可视化编辑器</h1>
        </div>
      </div>
      
      <div class="navbar-center">
        <div class="tabs tabs-boxed">
          <a 
            class="tab" 
            :class="{ 'tab-active': activeTab === 'nodes' }"
            @click="activeTab = 'nodes'"
          >
            节点编辑
          </a>
          <a 
            class="tab" 
            :class="{ 'tab-active': activeTab === 'variables' }"
            @click="activeTab = 'variables'"
          >
            变量管理
          </a>
          <a 
            class="tab" 
            :class="{ 'tab-active': activeTab === 'metadata' }"
            @click="activeTab = 'metadata'"
          >
            项目设置
          </a>
        </div>
      </div>
      
      <div class="navbar-end gap-2">
        <!-- 文件上传 input（隐藏） -->
        <input
          type="file"
          id="file-upload"
          class="hidden"
          accept=".json,.bandtwine"
          @change="handleFileUpload($event, false)"
        />
        <input
          type="file"
          id="project-upload"
          class="hidden"
          accept=".bandtwine,.json"
          @change="handleFileUpload($event, true)"
        />
        
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            导出
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
            <li><a @click="exportAsJSON">导出为 JSON</a></li>
            <li><a @click="exportProject">导出完整项目</a></li>
            <li><a @click="copyToClipboard">复制到剪贴板</a></li>
          </ul>
        </div>
        
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-secondary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
            </svg>
            导入
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
            <li><a @click="document.getElementById('file-upload').click()">导入 JSON 文件</a></li>
            <li><a @click="document.getElementById('project-upload').click()">导入项目文件</a></li>
            <li><a @click="importFromClipboard">从剪贴板导入</a></li>
            <li><a @click="loadSampleData">加载示例数据</a></li>
          </ul>
        </div>
        
        <!-- 面板控制按钮 -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-sm btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            布局
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
            <li>
              <a @click="showLeftPanel = !showLeftPanel">
                {{ showLeftPanel ? '隐藏' : '显示' }}左侧面板
              </a>
            </li>
            <li>
              <a @click="showRightPanel = !showRightPanel">
                {{ showRightPanel ? '隐藏' : '显示' }}右侧面板
              </a>
            </li>
            <li><a @click="showLeftPanel = true; showRightPanel = true">显示所有面板</a></li>
            <li><a @click="showLeftPanel = false; showRightPanel = false">隐藏所有面板</a></li>
          </ul>
        </div>
        
        <ThemeToggle />
      </div>
    </nav>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="alert alert-error rounded-none shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ errorMessage }}</span>
      <button class="btn btn-sm btn-ghost" @click="errorMessage = null">关闭</button>
    </div>

    <!-- 主内容区 -->
    <main class="container mx-auto p-4 pb-10">
      <!-- 节点编辑视图 -->
      <div v-if="activeTab === 'nodes'" class="grid grid-cols-12 gap-4">
        <!-- 左侧工具栏 -->
        <div :class="showLeftPanel ? 'col-span-2' : 'col-span-0 hidden'">
          <div class="card bg-base-200 shadow h-full">
            <div class="card-body p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="card-title text-sm">工具</h3>
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="showLeftPanel = false"
                  title="隐藏左侧面板"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="space-y-2">
                <button class="btn btn-primary btn-block btn-sm" @click="editorStore.createNode()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  添加节点
                </button>
                <button 
                  class="btn btn-error btn-block btn-sm" 
                  :disabled="!editorStore.selectedNodeId"
                  @click="editorStore.selectedNodeId && editorStore.deleteNode(editorStore.selectedNodeId)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  删除节点
                </button>
              </div>
              
              <div class="divider my-2"></div>
              
              <h3 class="card-title text-sm">节点列表</h3>
              <div class="space-y-1 max-h-60 overflow-y-auto">
                <div 
                  v-for="node in editorStore.visualNodes" 
                  :key="node.id"
                  class="flex items-center justify-between p-2 rounded hover:bg-base-300 cursor-pointer"
                  :class="{ 'bg-primary text-primary-content': editorStore.selectedNodeId === node.id }"
                  @click="editorStore.selectedNodeId = node.id"
                >
                  <span class="truncate text-sm">{{ node.id }}</span>
                  <span class="badge badge-xs" :class="node.id === editorStore.storyData.metadata.indexNode ? 'badge-success' : 'badge-neutral'">
                    {{ node.id === editorStore.storyData.metadata.indexNode ? '起始' : '普通' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中央节点图编辑器 -->
        <div :class="[
          !showLeftPanel && !showRightPanel ? 'col-span-12' : 
          !showLeftPanel && showRightPanel ? 'col-span-9' :
          showLeftPanel && !showRightPanel ? 'col-span-10' : 'col-span-7'
        ]">
          <div class="card bg-base-200 shadow h-full relative">
            <!-- 面板显示控制按钮（当面板隐藏时显示） -->
            <div v-if="!showLeftPanel" class="absolute left-0 top-4 z-10">
              <button 
                class="btn btn-xs btn-primary rounded-r-full rounded-l-none shadow-lg"
                @click="showLeftPanel = true"
                title="显示左侧面板"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-if="!showRightPanel" class="absolute right-0 top-4 z-10">
              <button 
                class="btn btn-xs btn-primary rounded-l-full rounded-r-none shadow-lg"
                @click="showRightPanel = true"
                title="显示右侧面板"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="card-body p-0 overflow-hidden">
              <NodeGraph />
            </div>
          </div>
        </div>

        <!-- 右侧属性编辑器 -->
        <div :class="showRightPanel ? 'col-span-3' : 'col-span-0 hidden'">
          <div class="card bg-base-200 shadow h-full">
            <div class="card-body p-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="card-title text-sm">
                  节点属性
                  <span v-if="editorStore.selectedNodeId" class="badge badge-neutral ml-2">
                    {{ editorStore.selectedNodeId }}
                  </span>
                </h3>
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="showRightPanel = false"
                  title="隐藏右侧面板"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div v-if="editorStore.selectedNode">
                <NodeEditor />
              </div>
              <div v-else class="text-center text-base-content/60 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>请选择一个节点进行编辑</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 变量管理视图 -->
      <div v-if="activeTab === 'variables'" class="max-w-4xl mx-auto">
        <VariablesPanel />
      </div>

      <!-- 项目设置视图 -->
      <div v-if="activeTab === 'metadata'" class="max-w-2xl mx-auto">
        <MetadataEditor />
      </div>
    </main>

    <!-- 底部状态栏 -->
    <footer class="sticky bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 p-2 text-xs z-10">
      <div class="container mx-auto flex justify-between items-center">
        <div>
          项目: {{ editorStore.storyData.metadata.title }}
          <span class="mx-2">|</span>
          节点数: {{ Object.keys(editorStore.storyData.nodes).length }}
          <span class="mx-2">|</span>
          变量数: {{ Object.keys(editorStore.storyData.variables).length }}
        </div>
        <div>
          <button class="btn btn-xs btn-ghost" @click="editorStore.reset">
            重置项目
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.card-body {
  padding: 1rem;
}
</style>