<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { ref, onMounted } from 'vue'

const editorStore = useEditorStore()
const containerRef = ref<HTMLElement>()

// 简单的节点图实现（后续将替换为 Vue Flow）
const draggingNode = ref<string | null>(null)
const dragStart = ref({ x: 0, y: 0 })

const handleNodeMouseDown = (nodeId: string, event: MouseEvent) => {
  draggingNode.value = nodeId
  dragStart.value = { x: event.clientX, y: event.clientY }
  editorStore.selectedNodeId = nodeId
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!draggingNode.value) return
  
  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y
  
  const position = editorStore.nodePositions[draggingNode.value]
  if (position) {
    editorStore.nodePositions[draggingNode.value] = {
      x: position.x + deltaX,
      y: position.y + deltaY
    }
  }
  
  dragStart.value = { x: event.clientX, y: event.clientY }
}

const handleMouseUp = () => {
  draggingNode.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

onMounted(() => {
  // 初始化节点位置（如果不存在）
  Object.keys(editorStore.storyData.nodes).forEach(id => {
    if (!editorStore.nodePositions[id]) {
      editorStore.nodePositions[id] = {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 50
      }
    }
  })
})
</script>

<template>
  <div 
    ref="containerRef"
    class="w-full h-[600px] bg-base-300 relative overflow-auto"
    @click="editorStore.selectedNodeId = null"
  >
    <!-- 连接线 -->
    <svg class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          fill="oklch(var(--bc))"
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      <g>
        <path
          v-for="link in editorStore.visualLinks"
          :key="link.id"
          :d="`M ${editorStore.nodePositions[link.source].x + 100} ${editorStore.nodePositions[link.source].y + 25} L ${editorStore.nodePositions[link.target].x} ${editorStore.nodePositions[link.target].y + 25}`"
          stroke="oklch(var(--bc))"
          stroke-width="2"
          fill="none"
          marker-end="url(#arrowhead)"
          class="opacity-50"
        />
      </g>
    </svg>

    <!-- 节点 -->
    <div
      v-for="node in editorStore.visualNodes"
      :key="node.id"
      class="absolute w-48 rounded-lg shadow-lg cursor-move transition-all duration-200"
      :class="[
        editorStore.selectedNodeId === node.id 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-300' 
          : 'ring-1 ring-base-content/20',
        node.id === editorStore.storyData.metadata.indexNode
          ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30'
          : 'bg-base-100'
      ]"
      :style="{
        left: `${editorStore.nodePositions[node.id].x}px`,
        top: `${editorStore.nodePositions[node.id].y}px`
      }"
      @mousedown="handleNodeMouseDown(node.id, $event)"
      @click.stop="editorStore.selectedNodeId = node.id"
    >
      <div class="p-3">
        <!-- 节点标题栏 -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="node.id === editorStore.storyData.metadata.indexNode ? 'bg-primary' : 'bg-secondary'"
            ></div>
            <span class="font-medium text-sm truncate">
              {{ node.id }}
            </span>
          </div>
          <div class="flex gap-1">
            <div 
              class="badge badge-xs"
              :class="node.data.links.length > 0 ? 'badge-info' : 'badge-warning'"
            >
              {{ node.data.links.length }} 链接
            </div>
          </div>
        </div>
        
        <!-- 节点内容预览 -->
        <div class="text-xs text-base-content/70 mb-2 line-clamp-2">
          {{ node.data.text.substring(0, 100) }}{{ node.data.text.length > 100 ? '...' : '' }}
        </div>
        
        <!-- 链接预览 -->
        <div class="space-y-1">
          <div 
            v-for="(link, index) in node.data.links.slice(0, 2)"
            :key="index"
            class="text-xs px-2 py-1 rounded bg-base-200 truncate"
          >
            → {{ link.text }} ({{ link.target }})
          </div>
          <div v-if="node.data.links.length > 2" class="text-xs px-2 py-1 text-center text-base-content/50">
            +{{ node.data.links.length - 2 }} 更多...
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div 
      v-if="editorStore.visualNodes.length === 0"
      class="absolute inset-0 flex items-center justify-center text-base-content/40"
    >
      <div class="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg font-medium">暂无节点</p>
        <p class="text-sm mt-1">点击左侧"添加节点"按钮开始创建</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>