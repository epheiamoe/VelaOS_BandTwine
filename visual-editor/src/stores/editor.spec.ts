import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from './editor'
import type { StoryData, ConditionOption, RandomOption, ImageDef } from '@/types'

describe('editor store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default data', () => {
    const store = useEditorStore()
    
    expect(store.storyData.metadata.title).toBe('未命名故事')
    expect(store.storyData.nodes).toHaveProperty('start')
    expect(store.selectedNodeId).toBe('start')
  })

  it('should create new node', () => {
    const store = useEditorStore()
    const initialNodeCount = Object.keys(store.storyData.nodes).length
    
    const newNodeId = store.createNode()
    
    expect(Object.keys(store.storyData.nodes)).toHaveLength(initialNodeCount + 1)
    expect(store.storyData.nodes[newNodeId]).toBeDefined()
    expect(store.storyData.nodes[newNodeId].text).toBe('新节点')
    expect(store.selectedNodeId).toBe(newNodeId)
  })

  it('should update node', () => {
    const store = useEditorStore()
    const newNodeText = '更新后的节点内容'
    
    store.updateNode('start', { text: newNodeText })
    
    expect(store.storyData.nodes.start.text).toBe(newNodeText)
  })

  it('should add link between nodes', () => {
    const store = useEditorStore()
    const targetNodeId = store.createNode()
    
    store.addLink('start', targetNodeId, '前往新节点')
    
    const startNode = store.storyData.nodes.start
    expect(startNode.links).toHaveLength(1)
    expect(startNode.links[0].target).toBe(targetNodeId)
    expect(startNode.links[0].text).toBe('前往新节点')
  })

  it('should delete node', () => {
    const store = useEditorStore()
    const nodeId = store.createNode()
    const initialNodeCount = Object.keys(store.storyData.nodes).length
    
    store.deleteNode(nodeId)
    
    expect(Object.keys(store.storyData.nodes)).toHaveLength(initialNodeCount - 1)
    expect(store.storyData.nodes[nodeId]).toBeUndefined()
  })

  it('should not delete start node', () => {
    const store = useEditorStore()
    
    expect(() => {
      store.deleteNode('start')
    }).toThrow('不能删除起始节点')
  })

  it('should update variable', () => {
    const store = useEditorStore()
    
    store.updateVariable('player.health', 100, '玩家生命值')
    
    // 简化检查
    expect(store.storyData.variables.player).toBeDefined()
  })

  it('should export story data', () => {
    const store = useEditorStore()
    const exported = store.exportStoryData()
    
    expect(exported.metadata.title).toBe('未命名故事')
    expect(exported.nodes.start).toBeDefined()
  })

  it('should import story data', () => {
    const store = useEditorStore()
    const newData: StoryData = {
      metadata: {
        title: '导入的故事',
        description: '',
        author: '测试作者',
        version: '2.0.0',
        versionCode: 2,
        releaseDate: '2025-01-01',
        license: 'MIT',
        copyright: '',
        indexNode: 'newStart'
      },
      variables: {
        test: { value: 'test' }
      },
      nodes: {
        newStart: {
          text: '新的起始节点',
          links: []
        }
      }
    }
    
    store.importStoryData(newData)
    
    expect(store.storyData.metadata.title).toBe('导入的故事')
    expect(store.storyData.nodes.newStart).toBeDefined()
    expect(store.selectedNodeId).toBe('newStart')
  })

  it('should reset to default', () => {
    const store = useEditorStore()
    store.createNode()
    store.updateVariable('test.value', 'test')
    
    store.reset()
    
    expect(store.storyData.metadata.title).toBe('未命名故事')
    expect(Object.keys(store.storyData.nodes)).toHaveLength(1)
    expect(store.selectedNodeId).toBe('start')
  })

  describe('condition system', () => {
    it('should add condition option to node', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const conditionId = 'cond1'
      const option: ConditionOption = {
        condition: 'var.world.time > 480',
        text: '早晨选项'
      }

      // 假设 store 有 addConditionOption 方法
      store.addConditionOption(nodeId, conditionId, option)

      expect(store.storyData.nodes[nodeId].conds?.[conditionId]).toHaveLength(1)
      expect(store.storyData.nodes[nodeId].conds?.[conditionId]?.[0]).toEqual(option)
    })

    it('should update condition option', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const conditionId = 'cond1'
      const option: ConditionOption = {
        condition: 'var.world.time > 480',
        text: '早晨选项'
      }
      store.addConditionOption(nodeId, conditionId, option)

      const updates = { text: '更新后的选项' }
      store.updateConditionOption(nodeId, conditionId, 0, updates)

      expect(store.storyData.nodes[nodeId].conds?.[conditionId]?.[0].text).toBe('更新后的选项')
      expect(store.storyData.nodes[nodeId].conds?.[conditionId]?.[0].condition).toBe('var.world.time > 480')
    })

    it('should delete condition option', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const conditionId = 'cond1'
      const option: ConditionOption = {
        condition: 'var.world.time > 480',
        text: '早晨选项'
      }
      store.addConditionOption(nodeId, conditionId, option)
      expect(store.storyData.nodes[nodeId].conds?.[conditionId]).toHaveLength(1)

      store.deleteConditionOption(nodeId, conditionId, 0)

      expect(store.storyData.nodes[nodeId].conds?.[conditionId]).toHaveLength(0)
    })
  })

  describe('random system', () => {
    it('should add random option to node', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const randomId = 'random1'
      const option: RandomOption = {
        text: '随机选项1',
        weight: 1
      }

      store.addRandomOption(nodeId, randomId, option)

      expect(store.storyData.nodes[nodeId].randoms?.[randomId]).toHaveLength(1)
      expect(store.storyData.nodes[nodeId].randoms?.[randomId]?.[0]).toEqual(option)
    })

    it('should update random option', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const randomId = 'random1'
      const option: RandomOption = {
        text: '随机选项1',
        weight: 1
      }
      const updates: Partial<RandomOption> = { text: '更新后的随机选项' }

      store.addRandomOption(nodeId, randomId, option)
      store.updateRandomOption(nodeId, randomId, 0, updates)

      expect(store.storyData.nodes[nodeId].randoms?.[randomId]?.[0].text).toBe('更新后的随机选项')
      expect(store.storyData.nodes[nodeId].randoms?.[randomId]?.[0].weight).toBe(1)
    })

    it('should delete random option', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const randomId = 'random1'
      const option: RandomOption = {
        text: '随机选项1',
        weight: 1
      }

      store.addRandomOption(nodeId, randomId, option)
      expect(store.storyData.nodes[nodeId].randoms?.[randomId]).toHaveLength(1)

      store.deleteRandomOption(nodeId, randomId, 0)

      expect(store.storyData.nodes[nodeId].randoms?.[randomId]).toHaveLength(0)
    })
  })

  describe('image system', () => {
    it('should add image definition to node', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const imageId = 'bg1'
      const def: ImageDef = {
        path: 'backgrounds/forest.png',
        width: 200
      }

      store.addImageDef(nodeId, imageId, def)

      expect(store.storyData.nodes[nodeId].imgs?.[imageId]).toEqual(def)
    })

    it('should update image definition', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const imageId = 'bg1'
      const def: ImageDef = {
        path: 'backgrounds/forest.png',
        width: 200
      }
      const updates: Partial<ImageDef> = { width: 300 }

      store.addImageDef(nodeId, imageId, def)
      store.updateImageDef(nodeId, imageId, updates)

      expect(store.storyData.nodes[nodeId].imgs?.[imageId].path).toBe('backgrounds/forest.png')
      expect(store.storyData.nodes[nodeId].imgs?.[imageId].width).toBe(300)
    })

    it('should delete image definition', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const imageId = 'bg1'
      const def: ImageDef = {
        path: 'backgrounds/forest.png',
        width: 200
      }

      store.addImageDef(nodeId, imageId, def)
      expect(store.storyData.nodes[nodeId].imgs?.[imageId]).toBeDefined()

      store.deleteImageDef(nodeId, imageId)

      expect(store.storyData.nodes[nodeId].imgs?.[imageId]).toBeUndefined()
    })
  })

  describe('action system', () => {
    it('should add action to node', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const action = {
        type: 'set' as const,
        target: 'var.player.health',
        value: 100
      }

      // 假设有 addNodeAction 方法
      store.addNodeAction(nodeId, action)

      expect(store.storyData.nodes[nodeId].actions).toHaveLength(1)
      expect(store.storyData.nodes[nodeId].actions?.[0]).toEqual(action)
    })

    it('should add action to link', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const targetNodeId = store.createNode()
      store.addLink(nodeId, targetNodeId, '测试链接')
      
      const action = {
        type: 'add' as const,
        target: 'var.player.gold',
        value: 50
      }

      // 假设有 addLinkAction 方法
      store.addLinkAction(nodeId, 0, action)

      const node = store.storyData.nodes[nodeId]
      expect(node.links[0].actions).toHaveLength(1)
      expect(node.links[0].actions?.[0]).toEqual(action)
    })

    it('should update node action', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const action = {
        type: 'set' as const,
        target: 'var.player.health',
        value: 100
      }
      
      store.addNodeAction(nodeId, action)
      const updates = { value: 150 }

      // 假设有 updateNodeAction 方法
      store.updateNodeAction(nodeId, 0, updates)

      expect(store.storyData.nodes[nodeId].actions?.[0].value).toBe(150)
      expect(store.storyData.nodes[nodeId].actions?.[0].type).toBe('set')
      expect(store.storyData.nodes[nodeId].actions?.[0].target).toBe('var.player.health')
    })

    it('should update link action', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const targetNodeId = store.createNode()
      store.addLink(nodeId, targetNodeId, '测试链接')
      const action = {
        type: 'add' as const,
        target: 'var.player.gold',
        value: 50
      }
      
      store.addLinkAction(nodeId, 0, action)
      const updates = { value: 100 }

      // 假设有 updateLinkAction 方法
      store.updateLinkAction(nodeId, 0, 0, updates)

      const node = store.storyData.nodes[nodeId]
      expect(node.links[0].actions?.[0].value).toBe(100)
      expect(node.links[0].actions?.[0].type).toBe('add')
      expect(node.links[0].actions?.[0].target).toBe('var.player.gold')
    })

    it('should delete node action', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const action = {
        type: 'set' as const,
        target: 'var.player.health',
        value: 100
      }
      
      store.addNodeAction(nodeId, action)
      expect(store.storyData.nodes[nodeId].actions).toHaveLength(1)

      // 假设有 deleteNodeAction 方法
      store.deleteNodeAction(nodeId, 0)

      expect(store.storyData.nodes[nodeId].actions).toHaveLength(0)
    })

    it('should delete link action', () => {
      const store = useEditorStore()
      const nodeId = store.createNode()
      const targetNodeId = store.createNode()
      store.addLink(nodeId, targetNodeId, '测试链接')
      const action = {
        type: 'add' as const,
        target: 'var.player.gold',
        value: 50
      }
      
      store.addLinkAction(nodeId, 0, action)
      const node = store.storyData.nodes[nodeId]
      expect(node.links[0].actions).toHaveLength(1)

      // 假设有 deleteLinkAction 方法
      store.deleteLinkAction(nodeId, 0, 0)

      expect(node.links[0].actions).toHaveLength(0)
    })
  })
})