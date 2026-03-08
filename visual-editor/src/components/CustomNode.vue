<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { useEditorStore } from '@/stores/editor'

defineProps<{
  nodeId: string
  data: any
  selected: boolean
  isStart: boolean
}>()

const editorStore = useEditorStore()
</script>

<template>
  <div
    class="w-48 rounded-lg shadow-lg cursor-move transition-all duration-200 relative"
    :class="[
      selected 
        ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-300' 
        : 'ring-1 ring-base-content/20',
      isStart
        ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30'
        : 'bg-base-100'
    ]"
    @click.stop="editorStore.selectedNodeId = nodeId"
  >
    <!-- 连接点（左侧输入） -->
    <Handle
      type="target"
      :position="Position.Left"
      class="!bg-primary/50 !border-2 !border-white"
      :style="{ left: '-8px', top: '50%' }"
    />
    
    <!-- 连接点（右侧输出） -->
    <Handle
      type="source"
      :position="Position.Right"
      class="!bg-secondary/50 !border-2 !border-white"
      :style="{ right: '-8px', top: '50%' }"
    />
    <div class="p-3">
      <!-- 节点标题栏 -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div 
            class="w-3 h-3 rounded-full"
            :class="isStart ? 'bg-primary' : 'bg-secondary'"
          ></div>
          <span class="font-medium text-sm truncate">
            {{ nodeId }}
          </span>
        </div>
        <div class="flex gap-1">
          <div 
            class="badge badge-xs"
            :class="data.links.length > 0 ? 'badge-info' : 'badge-warning'"
          >
            {{ data.links.length }} 链接
          </div>
        </div>
      </div>
      
      <!-- 节点内容预览 -->
      <div class="text-xs text-base-content/70 mb-2 line-clamp-2">
        {{ data.text.substring(0, 100) }}{{ data.text.length > 100 ? '...' : '' }}
      </div>
      
      <!-- 链接预览 -->
      <div class="space-y-1">
        <div 
          v-for="(link, index) in data.links.slice(0, 2)"
          :key="index"
          class="text-xs px-2 py-1 rounded bg-base-200 truncate"
        >
          → {{ link.text }} ({{ link.target }})
        </div>
        <div v-if="data.links.length > 2" class="text-xs px-2 py-1 text-center text-base-content/50">
          +{{ data.links.length - 2 }} 更多...
        </div>
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