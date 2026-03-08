import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StoryData, VisualNode, VisualLink, Metadata, Variables, Node, ConditionOption, RandomOption, ImageDef, Action, Link } from '@/types'

// 默认元数据
const defaultMetadata: Metadata = {
  title: '未命名故事',
  description: '',
  author: '',
  version: '1.0.0',
  versionCode: 1,
  releaseDate: new Date().toISOString().split('T')[0]!,
  license: 'CC-0',
  copyright: '',
  indexNode: 'start'
}

// 默认变量
const defaultVariables: Variables = {
  world: {
    time: 480,
    day: 1,
    formattedTime: '08:00',
    timePeriod: '早晨'
  },
  player: {
    name: {
      value: '玩家'
    },
    level: {
      value: 1
    }
  }
}

// 默认起始节点
const defaultStartNode: Node = {
  text: '欢迎来到 BandTwine 故事编辑器！\n\n这是一个起始节点。点击编辑按钮修改内容，或添加新的节点。',
  links: []
}

export const useEditorStore = defineStore('editor', () => {
  // 状态
  const storyData = ref<StoryData>({
    metadata: { ...defaultMetadata },
    variables: { ...defaultVariables },
    nodes: {
      start: { ...defaultStartNode }
    }
  })

  const selectedNodeId = ref<string | null>('start')
  const selectedLinkId = ref<string | null>(null)
  const viewport = ref({
    x: 0,
    y: 0,
    zoom: 1
  })

  // 节点位置映射（不在 storyData 中，是编辑器专用）
  const nodePositions = ref<Record<string, { x: number; y: number }>>({
    start: { x: 400, y: 200 }
  })

  // 计算属性
  const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null
    return storyData.value.nodes[selectedNodeId.value]
  })

  const visualNodes = computed<VisualNode[]>(() => {
    return Object.entries(storyData.value.nodes).map(([id, data]) => ({
      id,
      type: id === storyData.value.metadata.indexNode ? 'start' : 'normal',
      position: nodePositions.value[id] || { x: 0, y: 0 },
      data
    }))
  })

  const visualLinks = computed<VisualLink[]>(() => {
    const links: VisualLink[] = []
    Object.entries(storyData.value.nodes).forEach(([sourceId, node]: [string, Node]) => {
       node.links.forEach((link: Link, index: number) => {
        links.push({
          id: `${sourceId}-link-${index}`,
          source: sourceId,
          target: link.target,
          label: link.text,
          data: link
        })
      })
    })
    return links
  })

  // 操作方法
  function createNode(_type: 'normal' | 'branch' = 'normal') {
    const nodeId = `node_${Date.now()}`
    const newNode: Node = {
      text: '新节点',
      links: []
    }

    storyData.value.nodes[nodeId] = newNode
    nodePositions.value[nodeId] = { x: 100, y: 100 }
    selectedNodeId.value = nodeId

    return nodeId
  }

  function deleteNode(nodeId: string) {
    if (nodeId === storyData.value.metadata.indexNode) {
      throw new Error('不能删除起始节点')
    }

    // 删除节点
    delete storyData.value.nodes[nodeId]
    delete nodePositions.value[nodeId]

    // 删除指向该节点的所有链接
    Object.values(storyData.value.nodes).forEach((node: Node) => {
       node.links = node.links.filter((link: Link) => link.target !== nodeId)
    })

    // 清除选择
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
  }

  function updateNode(nodeId: string, updates: Partial<Node>) {
    const node = storyData.value.nodes[nodeId]
    if (!node) return

    storyData.value.nodes[nodeId] = { ...node, ...updates }
  }

  function addLink(sourceId: string, targetId: string, text: string = '选择') {
    const node = storyData.value.nodes[sourceId]
    if (!node || !storyData.value.nodes[targetId]) return

    node.links.push({
      text,
      target: targetId
    })
  }

  function updateLink(sourceId: string, linkIndex: number, updates: Partial<Link>) {
    const node = storyData.value.nodes[sourceId]
    if (!node || !node.links[linkIndex]) return

    node.links[linkIndex] = { ...node.links[linkIndex], ...updates }
  }

  function deleteLink(sourceId: string, linkIndex: number) {
    const node = storyData.value.nodes[sourceId]
    if (!node) return

    node.links.splice(linkIndex, 1)
  }

  // 条件选项管理
  function addConditionOption(nodeId: string, conditionId: string, option: ConditionOption) {
    const node = storyData.value.nodes[nodeId]
    if (!node) return

    if (!node.conds) {
      node.conds = {}
    }
    if (!node.conds[conditionId]) {
      node.conds[conditionId] = []
    }
    node.conds[conditionId].push(option)
  }

  function updateConditionOption(nodeId: string, conditionId: string, index: number, updates: Partial<ConditionOption>) {
    const node = storyData.value.nodes[nodeId]
    if (!node || !node.conds?.[conditionId]?.[index]) return

    node.conds[conditionId][index] = { ...node.conds[conditionId][index], ...updates }
  }

  function deleteConditionOption(nodeId: string, conditionId: string, index: number) {
    const node = storyData.value.nodes[nodeId]
    if (!node || !node.conds?.[conditionId]?.[index]) return

    node.conds[conditionId].splice(index, 1)
  }

  // 随机选项管理
  function addRandomOption(nodeId: string, randomId: string, option: RandomOption) {
    const node = storyData.value.nodes[nodeId]
    if (!node) return

    if (!node.randoms) {
      node.randoms = {}
    }
    if (!node.randoms[randomId]) {
      node.randoms[randomId] = []
    }
    node.randoms[randomId].push(option)
  }

  function updateRandomOption(nodeId: string, randomId: string, index: number, updates: Partial<RandomOption>) {
    const node = storyData.value.nodes[nodeId]
    if (!node || !node.randoms?.[randomId]?.[index]) return

    node.randoms[randomId][index] = { ...node.randoms[randomId][index], ...updates }
  }

  function deleteRandomOption(nodeId: string, randomId: string, index: number) {
    const node = storyData.value.nodes[nodeId]
    if (!node || !node.randoms?.[randomId]?.[index]) return

    node.randoms[randomId].splice(index, 1)
  }

  // 图片定义管理
  function addImageDef(nodeId: string, imageId: string, def: ImageDef) {
    const node = storyData.value.nodes[nodeId]
    if (!node) return

    if (!node.imgs) {
      node.imgs = {}
    }
    node.imgs[imageId] = def
  }

  function updateImageDef(nodeId: string, imageId: string, updates: Partial<ImageDef>) {
    const node = storyData.value.nodes[nodeId]
    if (!node || !node.imgs?.[imageId]) return

    node.imgs[imageId] = { ...node.imgs[imageId], ...updates }
  }

   function deleteImageDef(nodeId: string, imageId: string) {
     const node = storyData.value.nodes[nodeId]
     if (!node || !node.imgs?.[imageId]) return

     delete node.imgs[imageId]
   }

   // 节点动作管理
   function addNodeAction(nodeId: string, action: Action) {
     const node = storyData.value.nodes[nodeId]
     if (!node) return

     if (!node.actions) {
       node.actions = []
     }
     node.actions.push(action)
   }

   function updateNodeAction(nodeId: string, index: number, updates: Partial<Action>) {
     const node = storyData.value.nodes[nodeId]
     if (!node || !node.actions?.[index]) return

     node.actions[index] = { ...node.actions[index], ...updates }
   }

   function deleteNodeAction(nodeId: string, index: number) {
     const node = storyData.value.nodes[nodeId]
     if (!node || !node.actions?.[index]) return

     node.actions.splice(index, 1)
   }

   // 链接动作管理
   function addLinkAction(nodeId: string, linkIndex: number, action: Action) {
     const node = storyData.value.nodes[nodeId]
     if (!node || !node.links[linkIndex]) return

     const link = node.links[linkIndex]
     if (!link.actions) {
       link.actions = []
     }
     link.actions.push(action)
   }

   function updateLinkAction(nodeId: string, linkIndex: number, actionIndex: number, updates: Partial<Action>) {
     const node = storyData.value.nodes[nodeId]
     if (!node || !node.links[linkIndex]?.actions?.[actionIndex]) return

     node.links[linkIndex].actions![actionIndex] = { ...node.links[linkIndex].actions![actionIndex], ...updates }
   }

   function deleteLinkAction(nodeId: string, linkIndex: number, actionIndex: number) {
     const node = storyData.value.nodes[nodeId]
     if (!node || !node.links[linkIndex]?.actions?.[actionIndex]) return

     node.links[linkIndex].actions!.splice(actionIndex, 1)
   }

   function updateVariable(path: string, value: any, desc?: string) {
     // 简化实现：暂时只支持一级嵌套
     const parts = path.split('.')
     let current: any = storyData.value.variables

     for (let i = 0; i < parts.length - 1; i++) {
       const part = parts[i]!
       if (!current[part]) {
         current[part] = {}
       }
       current = current[part]
     }

     const lastPart = parts[parts.length - 1]!
     if (typeof current[lastPart] === 'object' && current[lastPart] !== null && 'value' in current[lastPart]) {
       current[lastPart].value = value
       if (desc !== undefined) {
         current[lastPart].desc = desc
       }
     } else {
       current[lastPart] = { value, desc }
     }
   }

  function importStoryData(data: StoryData) {
    storyData.value = data
    // 为每个新节点设置默认位置
    Object.keys(data.nodes).forEach(id => {
      if (!nodePositions.value[id]) {
        nodePositions.value[id] = { x: Math.random() * 800, y: Math.random() * 600 }
      }
    })
    // 设置选中的节点为起始节点
    selectedNodeId.value = data.metadata.indexNode
  }

  function exportStoryData(): StoryData {
    return { ...storyData.value }
  }

  function reset() {
    storyData.value = {
      metadata: { ...defaultMetadata },
      variables: { ...defaultVariables },
      nodes: {
        start: { ...defaultStartNode }
      }
    }
    nodePositions.value = {
      start: { x: 400, y: 200 }
    }
    selectedNodeId.value = 'start'
    selectedLinkId.value = null
    viewport.value = { x: 0, y: 0, zoom: 1 }
  }

  return {
    // 状态
    storyData,
    selectedNodeId,
    selectedLinkId,
    viewport,
    nodePositions,

    // 计算属性
    selectedNode,
    visualNodes,
    visualLinks,

    // 方法
    createNode,
    deleteNode,
    updateNode,
    addLink,
    updateLink,
    deleteLink,
    addConditionOption,
    updateConditionOption,
    deleteConditionOption,
    addRandomOption,
    updateRandomOption,
    deleteRandomOption,
     addImageDef,
     updateImageDef,
     deleteImageDef,
     addNodeAction,
     updateNodeAction,
     deleteNodeAction,
     addLinkAction,
     updateLinkAction,
     deleteLinkAction,
     updateVariable,
     importStoryData,
     exportStoryData,
     reset
  }
})