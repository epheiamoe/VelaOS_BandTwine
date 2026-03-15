<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { computed, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import CustomNode from './CustomNode.vue'

const editorStore = useEditorStore()
const { onNodeDragStop, onEdgeClick, onNodeClick, onConnect } = useVueFlow()

// 将 store 中的 visualNodes 和 visualLinks 映射为 Vue Flow 的 nodes 和 edges
const nodes = computed<Node[]>(() => 
  editorStore.visualNodes.map(visualNode => ({
    id: visualNode.id,
    type: visualNode.type === 'start' ? 'start' : 'default',
    position: visualNode.position,
    data: visualNode.data,
    label: visualNode.id,
    class: visualNode.id === editorStore.storyData.metadata.indexNode ? 'start-node' : 'normal-node',
    style: visualNode.id === editorStore.storyData.metadata.indexNode 
      ? {
          borderColor: 'oklch(var(--p))',
          background: 'linear-gradient(to bottom right, oklch(var(--p)/0.2), oklch(var(--p)/0.05))',
          borderWidth: '2px'
        } 
      : {}
  }))
)

const edges = computed<Edge[]>(() => 
  editorStore.visualLinks.map(visualLink => ({
    id: visualLink.id,
    source: visualLink.source,
    target: visualLink.target,
    label: visualLink.label,
    type: 'smoothstep',
    animated: false,
    style: { strokeWidth: 2 },
    data: visualLink.data
  }))
)

// 当节点拖拽停止时更新 store 中的位置
onNodeDragStop(({ node }) => {
  editorStore.nodePositions[node.id] = { x: node.position.x, y: node.position.y }
})

// 当节点被点击时选中
onNodeClick(({ node }) => {
  editorStore.selectedNodeId = node.id
})

// 当连线被点击时选中（可选）
onEdgeClick(() => {
  // 可以扩展：选中连线
})

// 当创建新连线时
onConnect((connection) => {
  if (connection.source && connection.target) {
    editorStore.addLink(connection.source, connection.target, '新选项')
  }
})



// 初始化节点位置（如果不存在）
watch(
  () => editorStore.storyData.nodes,
  (nodes) => {
    Object.keys(nodes).forEach(id => {
      if (!editorStore.nodePositions[id]) {
        editorStore.nodePositions[id] = {
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 50
        }
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="w-full h-full bg-base-300 rounded-lg">
    <VueFlow 
      :nodes="nodes"
      :edges="edges"
      :nodes-draggable="true"
      :nodes-connectable="true"
      :edges-selectable="true"
      :edges-deletable="true"
      :zoom-on-scroll="true"
      :pan-on-drag="true"
      :fit-view-on-init="false"
      class="!h-full !w-full vue-flow__container"
      @pane-click="editorStore.selectedNodeId = null"
    >
      <!-- 自定义节点模板 -->
      <template #node-start="{ data, id, selected }">
        <CustomNode :node-id="id" :data="data" :selected="selected" :is-start="true" />
      </template>
      <template #node-default="{ data, id, selected }">
        <CustomNode :node-id="id" :data="data" :selected="selected" :is-start="false" />
      </template>
      
      <!-- 空状态 -->
      <template #default v-if="nodes.length === 0">
        <div class="absolute inset-0 flex items-center justify-center text-base-content/40">
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-lg font-medium">暂无节点</p>
            <p class="text-sm mt-1">点击左侧"添加节点"按钮开始创建</p>
          </div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>