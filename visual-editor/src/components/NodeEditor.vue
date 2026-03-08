<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { ref, computed, watch } from 'vue'
import type { Link, Action, RandomOption, ImageDef } from '@/types'
import { previewText } from '@/utils/compiler'

const editorStore = useEditorStore()

const node = computed(() => editorStore.selectedNode!)
const nodeId = computed(() => editorStore.selectedNodeId!)

// 表单数据
const text = ref('')
const links = ref<Link[]>([])
const newNodeLinkTarget = ref('')

// 条件管理
const newConditionSetId = ref('')
const expandedConditionSet = ref<string | null>(null)
const newConditionOptionCondition = ref('')
const newConditionOptionText = ref('')

// 随机管理
const newRandomSetId = ref('')
const expandedRandomSet = ref<string | null>(null)
const newRandomOptionText = ref('')
const newRandomOptionWeight = ref(1)
const newRandomOptionCondition = ref('')

// 图片管理
const newImageId = ref('')
const expandedImageId = ref<string | null>(null)
const newImagePath = ref('')
const newImageWidth = ref(200)

// 动作管理
const expandedLinkActionIndex = ref<number | null>(null)
const newNodeAction = ref<Partial<Action>>({ type: 'set' })
const newLinkAction = ref<Partial<Action>>({ type: 'set' })
const editingActionIndex = ref<number | null>(null)
const editingActionType = ref<'node' | 'link' | null>(null)
const editingLinkIndex = ref<number | null>(null)

// 监听节点变化
watch(node, (newNode) => {
  if (newNode) {
    text.value = newNode.text
    links.value = [...newNode.links]
  }
}, { immediate: true })

// 实时预览文本（变量替换等）
const preview = computed(() => {
  return previewText(text.value, editorStore.storyData.variables, node.value.conds || {})
})

// 条件集
const conditionSets = computed(() => {
  return node.value.conds ? Object.entries(node.value.conds) : []
})

// 随机集
const randomSets = computed(() => {
  return node.value.randoms ? Object.entries(node.value.randoms) : []
})

// 图片定义
const imageDefs = computed(() => {
  return node.value.imgs ? Object.entries(node.value.imgs) : []
})

// 节点动作
const nodeActions = computed(() => {
  return node.value.actions || []
})

// 链接动作
const linkActions = computed(() => (linkIndex: number) => {
  return links.value[linkIndex]?.actions || []
})

// 更新节点文本
const updateText = () => {
  editorStore.updateNode(nodeId.value, { text: text.value })
}

// 添加链接
const addLink = () => {
  if (!newNodeLinkTarget.value.trim()) return
  
  editorStore.addLink(nodeId.value, newNodeLinkTarget.value.trim(), '新选项')
  newNodeLinkTarget.value = ''
  // 刷新链接列表
  links.value = [...node.value.links]
}

// 更新链接文本
const updateLinkText = (index: number, text: string) => {
  editorStore.updateLink(nodeId.value, index, { text })
}

// 删除链接
const deleteLink = (index: number) => {
  editorStore.deleteLink(nodeId.value, index)
  links.value.splice(index, 1)
}

// 条件管理方法
const addConditionSet = () => {
  if (!newConditionSetId.value.trim()) return
  const setId = newConditionSetId.value.trim()
  // 确保 conds 对象存在
  if (!node.value.conds) {
    editorStore.updateNode(nodeId.value, { conds: { [setId]: [] } })
  } else {
    editorStore.updateNode(nodeId.value, { conds: { ...node.value.conds, [setId]: [] } })
  }
  newConditionSetId.value = ''
  expandedConditionSet.value = setId
}

const addConditionOption = (setId: string, condition: string = '', optionText: string = '') => {
  if (!condition.trim() || !optionText.trim()) return
  editorStore.addConditionOption(nodeId.value, setId, { condition, text: optionText })
  newConditionOptionCondition.value = ''
  newConditionOptionText.value = ''
}

const updateConditionOption = (setId: string, index: number, updates: { condition?: string; text?: string }) => {
  editorStore.updateConditionOption(nodeId.value, setId, index, updates)
}

const deleteConditionOption = (setId: string, index: number) => {
  editorStore.deleteConditionOption(nodeId.value, setId, index)
}

const deleteConditionSet = (setId: string) => {
  if (!node.value.conds) return
  const newConds = { ...node.value.conds }
  delete newConds[setId]
  editorStore.updateNode(nodeId.value, { conds: newConds })
  if (expandedConditionSet.value === setId) {
    expandedConditionSet.value = null
  }
}

// 随机管理方法
const addRandomSet = () => {
  if (!newRandomSetId.value.trim()) return
  const setId = newRandomSetId.value.trim()
  // 确保 randoms 对象存在
  if (!node.value.randoms) {
    editorStore.updateNode(nodeId.value, { randoms: { [setId]: [] } })
  } else {
    editorStore.updateNode(nodeId.value, { randoms: { ...node.value.randoms, [setId]: [] } })
  }
  newRandomSetId.value = ''
  expandedRandomSet.value = setId
}

const addRandomOption = (setId: string, text: string = '', weight: number = 1, condition: string = '') => {
  if (!text.trim()) return
  editorStore.addRandomOption(nodeId.value, setId, { text, weight, condition })
  newRandomOptionText.value = ''
  newRandomOptionWeight.value = 1
  newRandomOptionCondition.value = ''
}

const updateRandomOption = (setId: string, index: number, updates: Partial<RandomOption>) => {
  editorStore.updateRandomOption(nodeId.value, setId, index, updates)
}

const deleteRandomOption = (setId: string, index: number) => {
  editorStore.deleteRandomOption(nodeId.value, setId, index)
}

const deleteRandomSet = (setId: string) => {
  if (!node.value.randoms) return
  const newRandoms = { ...node.value.randoms }
  delete newRandoms[setId]
  editorStore.updateNode(nodeId.value, { randoms: newRandoms })
  if (expandedRandomSet.value === setId) {
    expandedRandomSet.value = null
  }
}

// 图片管理方法
const addImageDef = () => {
  if (!newImageId.value.trim() || !newImagePath.value.trim()) return
  const id = newImageId.value.trim()
  editorStore.addImageDef(nodeId.value, id, { 
    path: newImagePath.value.trim(), 
    width: newImageWidth.value 
  })
  newImageId.value = ''
  newImagePath.value = ''
  newImageWidth.value = 200
  expandedImageId.value = id
}

const updateImageDef = (imageId: string, updates: Partial<ImageDef>) => {
  editorStore.updateImageDef(nodeId.value, imageId, updates)
}

const deleteImageDef = (imageId: string) => {
  editorStore.deleteImageDef(nodeId.value, imageId)
  if (expandedImageId.value === imageId) {
    expandedImageId.value = null
  }
}

// 动作管理方法
const addNodeAction = () => {
  if (!newNodeAction.value.type) return
  editorStore.addNodeAction(nodeId.value, newNodeAction.value as Action)
  newNodeAction.value = { type: 'set' }
}

const updateNodeAction = (index: number, updates: Partial<Action>) => {
  editorStore.updateNodeAction(nodeId.value, index, updates)
}

const deleteNodeAction = (index: number) => {
  editorStore.deleteNodeAction(nodeId.value, index)
}

const addLinkAction = (linkIndex: number) => {
  if (!newLinkAction.value.type) return
  editorStore.addLinkAction(nodeId.value, linkIndex, newLinkAction.value as Action)
  newLinkAction.value = { type: 'set' }
}

const updateLinkAction = (linkIndex: number, actionIndex: number, updates: Partial<Action>) => {
  editorStore.updateLinkAction(nodeId.value, linkIndex, actionIndex, updates)
}

const deleteLinkAction = (linkIndex: number, actionIndex: number) => {
  editorStore.deleteLinkAction(nodeId.value, linkIndex, actionIndex)
}

const startEditAction = (type: 'node' | 'link', index: number, linkIndex?: number) => {
  editingActionType.value = type
  editingActionIndex.value = index
  editingLinkIndex.value = linkIndex ?? null
  
  let action: Action | undefined
  if (type === 'node') {
    action = nodeActions.value[index]
  } else if (type === 'link' && linkIndex !== undefined) {
    action = linkActions.value(linkIndex)[index]
  }
  
  if (action) {
    if (type === 'node') {
      newNodeAction.value = { ...action }
    } else {
      newLinkAction.value = { ...action }
    }
  }
}

const cancelEditAction = () => {
  editingActionType.value = null
  editingActionIndex.value = null
  editingLinkIndex.value = null
  newNodeAction.value = { type: 'set' }
  newLinkAction.value = { type: 'set' }
}

const saveEditAction = () => {
  if (editingActionType.value === 'node' && editingActionIndex.value !== null) {
    updateNodeAction(editingActionIndex.value, newNodeAction.value as Action)
  } else if (editingActionType.value === 'link' && editingActionIndex.value !== null && editingLinkIndex.value !== null) {
    updateLinkAction(editingLinkIndex.value, editingActionIndex.value, newLinkAction.value as Action)
  }
  cancelEditAction()
}

const actionTypeOptions = [
  { value: 'set', label: '设置变量' },
  { value: 'add', label: '增加变量' },
  { value: 'toggle', label: '切换变量' },
  { value: 'vibrate', label: '震动' },
  { value: 'addListener', label: '添加监听器' },
  { value: 'removeListener', label: '移除监听器' },
  { value: 'autosave', label: '自动保存' },
  { value: 'advanceTime', label: '推进时间' },
  { value: 'toast', label: '提示消息' },
  { value: 'jump', label: '跳转到节点' },
]
</script>

<template>
  <div class="space-y-4">
    <!-- 节点ID -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">节点 ID</span>
      </label>
      <div class="input input-bordered input-sm bg-base-300">{{ nodeId }}</div>
    </div>

    <!-- 节点文本 -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">节点内容</span>
      </label>
      <textarea 
        v-model="text"
        class="textarea textarea-bordered h-32 textarea-sm"
        placeholder="输入节点文本内容..."
        @blur="updateText"
      ></textarea>
      <div class="label">
        <span class="label-text-alt">支持变量引用如 {var.world.time}</span>
      </div>
      
      <!-- 实时预览 -->
      <div class="mt-3">
        <div class="label">
          <span class="label-text font-medium">实时预览</span>
        </div>
        <div class="bg-base-200 rounded-lg p-3 text-sm whitespace-pre-wrap border border-base-300 min-h-12">
          {{ preview }}
        </div>
        <div class="label">
          <span class="label-text-alt text-info">变量、条件等标记已替换为预览占位符</span>
        </div>
      </div>
    </div>

    <!-- 链接管理 -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium">链接选项</h4>
        <span class="badge badge-neutral">{{ links.length }}</span>
      </div>

      <!-- 添加新链接 -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="newNodeLinkTarget"
          type="text"
          class="input input-bordered input-sm flex-1"
          placeholder="输入目标节点ID"
          @keyup.enter="addLink"
        >
        <button class="btn btn-primary btn-sm" @click="addLink">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 链接列表 -->
      <div v-if="links.length > 0" class="space-y-2">
        <div 
          v-for="(link, index) in links"
          :key="index"
          class="card bg-base-300"
        >
          <div class="card-body p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">链接 {{ index + 1 }}</span>
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="expandedLinkActionIndex = expandedLinkActionIndex === index ? null : index"
                >
                  <svg v-if="expandedLinkActionIndex === index" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <div v-if="link.actions && link.actions.length > 0" class="badge badge-info badge-xs">
                  {{ link.actions.length }} 个动作
                </div>
              </div>
              <button 
                class="btn btn-xs btn-ghost btn-error"
                @click="deleteLink(index)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text text-xs">显示文本</span>
              </label>
              <input
                :value="link.text"
                @input="updateLinkText(index, ($event.target as HTMLInputElement).value)"
                type="text"
                class="input input-bordered input-xs"
                placeholder="链接显示文本"
              >
            </div>
            
            <div class="form-control mt-2">
              <label class="label">
                <span class="label-text text-xs">目标节点</span>
              </label>
              <div class="input input-bordered input-xs bg-base-300">{{ link.target }}</div>
            </div>

            <!-- 链接动作管理 -->
            <div v-if="expandedLinkActionIndex === index" class="mt-3 border-t pt-3">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">链接动作</span>
                <span class="badge badge-neutral badge-xs">{{ link.actions?.length || 0 }} 个动作</span>
              </div>
              
              <!-- 添加新动作 -->
              <div class="bg-base-200 rounded-lg p-2 mb-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium">{{ editingActionType === 'link' && editingLinkIndex === index && editingActionIndex !== null ? '编辑动作' : '添加新动作' }}</span>
                  <div v-if="editingActionType === 'link' && editingLinkIndex === index && editingActionIndex !== null" class="flex gap-1">
                    <button class="btn btn-xs btn-ghost" @click="cancelEditAction">取消</button>
                    <button class="btn btn-xs btn-primary" @click="saveEditAction">保存</button>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-1">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text text-xs">动作类型</span>
                    </label>
                    <select v-model="newLinkAction.type" class="select select-bordered select-xs">
                      <option v-for="option in actionTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text text-xs">目标变量/值</span>
                    </label>
                    <input
                      v-model="newLinkAction.target"
                      type="text"
                      class="input input-bordered input-xs"
                      placeholder="变量路径或值"
                    >
                  </div>
                </div>
                
                <div v-if="['set', 'add', 'toggle'].includes(newLinkAction.type || '')" class="form-control mt-1">
                  <label class="label">
                    <span class="label-text text-xs">值</span>
                  </label>
                  <input
                    v-model="newLinkAction.value"
                    type="text"
                    class="input input-bordered input-xs"
                    placeholder="设置的值"
                  >
                </div>
                
                <div v-if="newLinkAction.type === 'vibrate'" class="form-control mt-1">
                  <label class="label">
                    <span class="label-text text-xs">震动模式</span>
                  </label>
                  <input
                    v-model="newLinkAction.mode"
                    type="text"
                    class="input input-bordered input-xs"
                    placeholder="模式ID"
                  >
                </div>
                
                <div v-if="newLinkAction.type === 'toast'" class="form-control mt-1">
                  <label class="label">
                    <span class="label-text text-xs">提示消息</span>
                  </label>
                  <input
                    v-model="newLinkAction.message"
                    type="text"
                    class="input input-bordered input-xs"
                    placeholder="消息内容"
                  >
                </div>
                
                <div v-if="newLinkAction.type === 'advanceTime'" class="form-control mt-1">
                  <label class="label">
                    <span class="label-text text-xs">分钟数</span>
                  </label>
                  <input
                    v-model="newLinkAction.minutes"
                    type="number"
                    class="input input-bordered input-xs"
                    placeholder="分钟"
                  >
                </div>
                
                <div v-if="newLinkAction.type === 'jump'" class="form-control mt-1">
                  <label class="label">
                    <span class="label-text text-xs">目标节点ID</span>
                  </label>
                  <input
                    v-model="newLinkAction.target"
                    type="text"
                    class="input input-bordered input-xs"
                    placeholder="节点ID"
                  >
                 </div>
                
                <div class="form-control mt-1">
                  <label class="label">
                    <span class="label-text text-xs">条件 (可选)</span>
                  </label>
                  <input
                    v-model="newLinkAction.condition"
                    type="text"
                    class="input input-bordered input-xs"
                    placeholder="条件表达式 (如: var.world.time > 480)"
                  >
                </div>
                
                <div class="mt-2">
                  <button v-if="editingActionType === 'link' && editingLinkIndex === index && editingActionIndex !== null" class="btn btn-primary btn-xs w-full" @click="saveEditAction">
                    保存修改
                  </button>
                  <button v-else class="btn btn-primary btn-xs w-full" @click="addLinkAction(index)">
                    添加动作
                  </button>
                </div>
              </div>
              
              <!-- 动作列表 -->
              <div v-if="link.actions && link.actions.length > 0" class="space-y-1">
                <div 
                  v-for="(action, actionIndex) in link.actions"
                  :key="actionIndex"
                  class="bg-base-200 rounded p-1"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-1">
                      <span class="badge badge-xs" :class="{
                        'badge-primary': action.type === 'set',
                        'badge-secondary': action.type === 'add',
                        'badge-accent': action.type === 'toggle',
                        'badge-warning': action.type === 'vibrate',
                        'badge-info': action.type === 'toast',
                        'badge-success': action.type === 'jump',
                        'badge-neutral': ['addListener', 'removeListener', 'autosave', 'advanceTime'].includes(action.type)
                      }">
                        {{ actionTypeOptions.find(opt => opt.value === action.type)?.label || action.type }}
                      </span>
                      <span v-if="action.target" class="text-xs">{{ action.target }}</span>
                    </div>
                    <div class="flex gap-1">
                      <button class="btn btn-xs btn-ghost" @click="startEditAction('link', actionIndex, index)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button class="btn btn-xs btn-ghost btn-error" @click="deleteLinkAction(index, actionIndex)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="action.value !== undefined" class="text-xs">
                    <span class="text-base-content/60">值:</span> {{ action.value }}
                  </div>
                  <div v-if="action.mode" class="text-xs">
                    <span class="text-base-content/60">模式:</span> {{ action.mode }}
                  </div>
                  <div v-if="action.message" class="text-xs">
                    <span class="text-base-content/60">消息:</span> {{ action.message }}
                  </div>
                  <div v-if="action.minutes !== undefined" class="text-xs">
                    <span class="text-base-content/60">分钟:</span> {{ action.minutes }}
                  </div>
                  <div v-if="action.condition" class="text-xs">
                    <span class="text-base-content/60">条件:</span> {{ action.condition }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-2 text-base-content/50 text-xs">
                暂无链接动作
              </div>
            </div>
            <div v-else-if="link.actions && link.actions.length > 0" class="mt-2">
              <div class="badge badge-info badge-xs">
                {{ link.actions.length }} 个动作
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-6 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <p class="text-sm">暂无链接</p>
        <p class="text-xs mt-1">添加上方链接以创建分支</p>
      </div>
    </div>

    <!-- 条件管理 -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium">条件系统</h4>
        <span class="badge badge-info badge-xs">{{ conditionSets.length }} 个条件集</span>
      </div>
      
      <!-- 添加新条件集 -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="newConditionSetId"
          type="text"
          class="input input-bordered input-sm flex-1"
          placeholder="输入条件集ID (如: morningOptions)"
          @keyup.enter="addConditionSet"
        >
        <button class="btn btn-primary btn-sm" @click="addConditionSet">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 条件集列表 -->
      <div v-if="conditionSets.length > 0" class="space-y-3">
        <div 
          v-for="([setId, options]) in conditionSets"
          :key="setId"
          class="card bg-base-300"
        >
          <div class="card-body p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="expandedConditionSet = expandedConditionSet === setId ? null : setId"
                >
                  <svg v-if="expandedConditionSet === setId" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="font-medium text-sm">{{ setId }}</span>
                <span class="badge badge-neutral badge-xs">{{ options.length }} 个选项</span>
              </div>
              <button 
                class="btn btn-xs btn-ghost btn-error"
                @click="deleteConditionSet(setId)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- 展开的条件选项 -->
            <div v-if="expandedConditionSet === setId" class="mt-3 space-y-2">
              <!-- 添加新选项 -->
              <div class="flex gap-2 mb-2">
                <input
                  v-model="newConditionOptionCondition"
                  type="text"
                  class="input input-bordered input-xs flex-1"
                  placeholder="条件表达式 (如: var.world.time > 480)"
                  @keyup.enter="addConditionOption(setId, newConditionOptionCondition, newConditionOptionText)"
                >
                <input
                  v-model="newConditionOptionText"
                  type="text"
                  class="input input-bordered input-xs flex-1"
                  placeholder="选项文本"
                  @keyup.enter="addConditionOption(setId, newConditionOptionCondition, newConditionOptionText)"
                >
                <button 
                  class="btn btn-primary btn-xs"
                  @click="addConditionOption(setId, newConditionOptionCondition, newConditionOptionText)"
                >
                  添加
                </button>
              </div>
              
              <!-- 选项列表 -->
              <div v-if="options.length > 0" class="space-y-2">
                <div 
                  v-for="(option, index) in options"
                  :key="index"
                  class="bg-base-200 rounded p-2"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-medium">选项 {{ index + 1 }}</span>
                    <button 
                      class="btn btn-xs btn-ghost btn-error"
                      @click="deleteConditionOption(setId, index)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text text-xs">条件</span>
                    </label>
                    <input
                      :value="option.condition"
                      @input="updateConditionOption(setId, index, { condition: ($event.target as HTMLInputElement).value })"
                      type="text"
                      class="input input-bordered input-xs"
                      placeholder="条件表达式"
                    >
                  </div>
                  <div class="form-control mt-1">
                    <label class="label">
                      <span class="label-text text-xs">文本</span>
                    </label>
                    <input
                      :value="option.text"
                      @input="updateConditionOption(setId, index, { text: ($event.target as HTMLInputElement).value })"
                      type="text"
                      class="input input-bordered input-xs"
                      placeholder="选项文本"
                    >
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-3 text-base-content/50 text-xs">
                暂无条件选项，添加一个条件选项
              </div>
            </div>
            
            <div v-else class="text-xs text-base-content/60 mt-1">
              点击展开编辑 {{ options.length }} 个条件选项
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-4 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">暂无条件集</p>
        <p class="text-xs mt-1">添加上方条件集以创建条件分支</p>
      </div>
    </div>

    <!-- 随机选项管理 -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium">随机选项</h4>
        <span class="badge badge-warning badge-xs">{{ randomSets.length }} 个随机集</span>
      </div>
      
      <!-- 添加新随机集 -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="newRandomSetId"
          type="text"
          class="input input-bordered input-sm flex-1"
          placeholder="输入随机集ID (如: randomChoices)"
          @keyup.enter="addRandomSet"
        >
        <button class="btn btn-primary btn-sm" @click="addRandomSet">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 随机集列表 -->
      <div v-if="randomSets.length > 0" class="space-y-3">
        <div 
          v-for="([setId, options]) in randomSets"
          :key="setId"
          class="card bg-base-300"
        >
          <div class="card-body p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="expandedRandomSet = expandedRandomSet === setId ? null : setId"
                >
                  <svg v-if="expandedRandomSet === setId" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="font-medium text-sm">{{ setId }}</span>
                <span class="badge badge-neutral badge-xs">{{ options.length }} 个选项</span>
              </div>
              <button 
                class="btn btn-xs btn-ghost btn-error"
                @click="deleteRandomSet(setId)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- 展开的随机选项 -->
            <div v-if="expandedRandomSet === setId" class="mt-3 space-y-2">
              <!-- 添加新选项 -->
              <div class="flex gap-2 mb-2">
                <input
                  v-model="newRandomOptionText"
                  type="text"
                  class="input input-bordered input-xs flex-1"
                  placeholder="选项文本"
                  @keyup.enter="addRandomOption(setId, newRandomOptionText, newRandomOptionWeight, newRandomOptionCondition)"
                >
                <input
                  v-model="newRandomOptionWeight"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs w-20"
                  placeholder="权重"
                  @keyup.enter="addRandomOption(setId, newRandomOptionText, newRandomOptionWeight, newRandomOptionCondition)"
                >
                <input
                  v-model="newRandomOptionCondition"
                  type="text"
                  class="input input-bordered input-xs flex-1"
                  placeholder="条件表达式 (可选)"
                  @keyup.enter="addRandomOption(setId, newRandomOptionText, newRandomOptionWeight, newRandomOptionCondition)"
                >
                <button 
                  class="btn btn-primary btn-xs"
                  @click="addRandomOption(setId, newRandomOptionText, newRandomOptionWeight, newRandomOptionCondition)"
                >
                  添加
                </button>
              </div>
              
              <!-- 选项列表 -->
              <div v-if="options.length > 0" class="space-y-2">
                <div 
                  v-for="(option, index) in options"
                  :key="index"
                  class="bg-base-200 rounded p-2"
                >
                  <div class="flex justify-between items-start mb-1">
                    <span class="text-xs font-medium">选项 {{ index + 1 }}</span>
                    <button 
                      class="btn btn-xs btn-ghost btn-error"
                      @click="deleteRandomOption(setId, index)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text text-xs">文本</span>
                    </label>
                    <input
                      :value="option.text"
                      @input="updateRandomOption(setId, index, { text: ($event.target as HTMLInputElement).value })"
                      type="text"
                      class="input input-bordered input-xs"
                      placeholder="选项文本"
                    >
                  </div>
                  <div class="form-control mt-1">
                    <label class="label">
                      <span class="label-text text-xs">权重</span>
                    </label>
                    <input
                      :value="option.weight"
                      @input="updateRandomOption(setId, index, { weight: parseInt(($event.target as HTMLInputElement).value) || 1 })"
                      type="number"
                      min="1"
                      class="input input-bordered input-xs"
                      placeholder="权重"
                    >
                  </div>
                  <div class="form-control mt-1">
                    <label class="label">
                      <span class="label-text text-xs">条件 (可选)</span>
                    </label>
                    <input
                      :value="option.condition"
                      @input="updateRandomOption(setId, index, { condition: ($event.target as HTMLInputElement).value })"
                      type="text"
                      class="input input-bordered input-xs"
                      placeholder="条件表达式"
                    >
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-3 text-base-content/50 text-xs">
                暂无随机选项，添加一个随机选项
              </div>
            </div>
            
            <div v-else class="text-xs text-base-content/60 mt-1">
              点击展开编辑 {{ options.length }} 个随机选项
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-4 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">暂无随机集</p>
        <p class="text-xs mt-1">添加上方随机集以创建随机分支</p>
      </div>
    </div>

    <!-- 图片定义管理 -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium">图片定义</h4>
        <span class="badge badge-success badge-xs">{{ imageDefs.length }} 个图片</span>
      </div>
      
      <!-- 添加新图片定义 -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="newImageId"
          type="text"
          class="input input-bordered input-sm flex-1"
          placeholder="图片ID (如: bg1)"
          @keyup.enter="addImageDef"
        >
        <input
          v-model="newImagePath"
          type="text"
          class="input input-bordered input-sm flex-1"
          placeholder="图片路径 (如: backgrounds/forest.png)"
          @keyup.enter="addImageDef"
        >
        <input
          v-model="newImageWidth"
          type="number"
          min="1"
          class="input input-bordered input-sm w-24"
          placeholder="宽度"
          @keyup.enter="addImageDef"
        >
        <button class="btn btn-primary btn-sm" @click="addImageDef">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 图片定义列表 -->
      <div v-if="imageDefs.length > 0" class="space-y-3">
        <div 
          v-for="([imageId, def]) in imageDefs"
          :key="imageId"
          class="card bg-base-300"
        >
          <div class="card-body p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <button 
                  class="btn btn-xs btn-ghost"
                  @click="expandedImageId = expandedImageId === imageId ? null : imageId"
                >
                  <svg v-if="expandedImageId === imageId" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="font-medium text-sm">{{ imageId }}</span>
                <span class="badge badge-neutral badge-xs">宽度: {{ def.width }}px</span>
              </div>
              <button 
                class="btn btn-xs btn-ghost btn-error"
                @click="deleteImageDef(imageId)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- 展开的图片定义 -->
            <div v-if="expandedImageId === imageId" class="mt-3 space-y-2">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-xs">图片路径</span>
                </label>
                <input
                  :value="def.path"
                  @input="updateImageDef(imageId, { path: ($event.target as HTMLInputElement).value })"
                  type="text"
                  class="input input-bordered input-xs"
                  placeholder="图片路径"
                >
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-xs">宽度 (像素)</span>
                </label>
                <input
                  :value="def.width"
                  @input="updateImageDef(imageId, { width: parseInt(($event.target as HTMLInputElement).value) || 200 })"
                  type="number"
                  min="1"
                  class="input input-bordered input-xs"
                  placeholder="宽度"
                >
              </div>
            </div>
            
            <div v-else class="text-xs text-base-content/60 mt-1">
              点击展开编辑图片定义: {{ def.path }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-4 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm">暂无图片定义</p>
        <p class="text-xs mt-1">添加上方图片定义以在节点中引用图片</p>
      </div>
    </div>

    <!-- 节点动作管理 -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium">节点动作</h4>
        <span class="badge badge-neutral badge-xs">{{ nodeActions.length }} 个动作</span>
      </div>
      
      <!-- 添加新动作 -->
      <div class="bg-base-300 rounded-lg p-3 mb-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">{{ editingActionType === 'node' && editingActionIndex !== null ? '编辑动作' : '添加新动作' }}</span>
          <div v-if="editingActionType === 'node' && editingActionIndex !== null" class="flex gap-1">
            <button class="btn btn-xs btn-ghost" @click="cancelEditAction">取消</button>
            <button class="btn btn-xs btn-primary" @click="saveEditAction">保存</button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-xs">动作类型</span>
            </label>
            <select v-model="newNodeAction.type" class="select select-bordered select-sm">
              <option v-for="option in actionTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-xs">目标变量/值</span>
            </label>
            <input
              v-model="newNodeAction.target"
              type="text"
              class="input input-bordered input-sm"
              placeholder="变量路径或值"
            >
          </div>
        </div>
        
        <div v-if="['set', 'add', 'toggle'].includes(newNodeAction.type || '')" class="form-control mt-2">
          <label class="label">
            <span class="label-text text-xs">值</span>
          </label>
          <input
            v-model="newNodeAction.value"
            type="text"
            class="input input-bordered input-sm"
            placeholder="设置的值"
          >
        </div>
        
        <div v-if="newNodeAction.type === 'vibrate'" class="form-control mt-2">
          <label class="label">
            <span class="label-text text-xs">震动模式</span>
          </label>
          <input
            v-model="newNodeAction.mode"
            type="text"
            class="input input-bordered input-sm"
            placeholder="模式ID"
          >
        </div>
        
        <div v-if="newNodeAction.type === 'toast'" class="form-control mt-2">
          <label class="label">
            <span class="label-text text-xs">提示消息</span>
          </label>
          <input
            v-model="newNodeAction.message"
            type="text"
            class="input input-bordered input-sm"
            placeholder="消息内容"
          >
        </div>
        
        <div v-if="newNodeAction.type === 'advanceTime'" class="form-control mt-2">
          <label class="label">
            <span class="label-text text-xs">分钟数</span>
          </label>
          <input
            v-model="newNodeAction.minutes"
            type="number"
            class="input input-bordered input-sm"
            placeholder="分钟"
          >
        </div>
        
        <div v-if="newNodeAction.type === 'jump'" class="form-control mt-2">
          <label class="label">
            <span class="label-text text-xs">目标节点ID</span>
          </label>
          <input
            v-model="newNodeAction.target"
            type="text"
            class="input input-bordered input-sm"
            placeholder="节点ID"
          >
        </div>
        
        <div class="form-control mt-2">
          <label class="label">
            <span class="label-text text-xs">条件 (可选)</span>
          </label>
          <input
            v-model="newNodeAction.condition"
            type="text"
            class="input input-bordered input-sm"
            placeholder="条件表达式 (如: var.world.time > 480)"
          >
        </div>
        
        <div class="mt-3">
          <button v-if="editingActionType === 'node' && editingActionIndex !== null" class="btn btn-primary btn-sm w-full" @click="saveEditAction">
            保存修改
          </button>
          <button v-else class="btn btn-primary btn-sm w-full" @click="addNodeAction">
            添加动作
          </button>
        </div>
      </div>
      
      <!-- 动作列表 -->
      <div v-if="nodeActions.length > 0" class="space-y-2">
        <div 
          v-for="(action, index) in nodeActions"
          :key="index"
          class="card bg-base-300"
        >
          <div class="card-body p-3">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="badge badge-sm" :class="{
                  'badge-primary': action.type === 'set',
                  'badge-secondary': action.type === 'add',
                  'badge-accent': action.type === 'toggle',
                  'badge-warning': action.type === 'vibrate',
                  'badge-info': action.type === 'toast',
                  'badge-success': action.type === 'jump',
                  'badge-neutral': ['addListener', 'removeListener', 'autosave', 'advanceTime'].includes(action.type)
                }">
                  {{ actionTypeOptions.find(opt => opt.value === action.type)?.label || action.type }}
                </span>
                <span v-if="action.target" class="text-xs font-medium">{{ action.target }}</span>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-xs btn-ghost" @click="startEditAction('node', index)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="btn btn-xs btn-ghost btn-error" @click="deleteNodeAction(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-if="action.value !== undefined" class="text-xs mt-1">
              <span class="text-base-content/60">值:</span> {{ action.value }}
            </div>
            <div v-if="action.mode" class="text-xs mt-1">
              <span class="text-base-content/60">模式:</span> {{ action.mode }}
            </div>
            <div v-if="action.message" class="text-xs mt-1">
              <span class="text-base-content/60">消息:</span> {{ action.message }}
            </div>
            <div v-if="action.minutes !== undefined" class="text-xs mt-1">
              <span class="text-base-content/60">分钟:</span> {{ action.minutes }}
            </div>
            <div v-if="action.condition" class="text-xs mt-1">
              <span class="text-base-content/60">条件:</span> {{ action.condition }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-4 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm">暂无节点动作</p>
        <p class="text-xs mt-1">添加上方动作以修改变量或触发效果</p>
      </div>
    </div>
    
    <!-- 高级功能占位 -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium">高级功能</h4>
        <span class="badge badge-warning badge-xs">开发中</span>
      </div>
      
      <div class="grid grid-cols-1 gap-2">
        <button class="btn btn-outline btn-sm">
          随机选项
        </button>
        <button class="btn btn-outline btn-sm">
          图片定义
        </button>
      </div>
    </div>
  </div>
</template>