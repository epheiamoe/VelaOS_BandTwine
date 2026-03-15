import { describe, it, expect } from 'vitest'
import {
  validateStoryData,
  exportToBandTwineJSON,
  importFromBandTwineJSON,
  exportProjectFile,
  importProjectFile,
  generateSampleStoryData,
  downloadFile,
  readUploadedFile
} from './importExport'
import type { StoryData } from '@/types'

describe('importExport utilities', () => {
  const validStoryData: StoryData = {
    metadata: {
      title: '测试故事',
      description: '测试描述',
      author: '测试作者',
      version: '1.0.0',
      versionCode: 1,
      releaseDate: '2025-01-01',
      license: 'CC-0',
      copyright: '',
      indexNode: 'start'
    },
    variables: {
      player: {
        name: { value: '玩家' }
      }
    },
    nodes: {
      start: {
        text: '起始节点',
        links: []
      }
    }
  }

  describe('validateStoryData', () => {
    it('should validate correct story data', () => {
      expect(() => validateStoryData(validStoryData)).not.toThrow()
      expect(validateStoryData(validStoryData)).toBe(true)
    })

    it('should throw error for missing metadata', () => {
      const invalidData = { ...validStoryData, metadata: undefined }
      expect(() => validateStoryData(invalidData)).toThrow('缺少元数据 (metadata)')
    })

    it('should throw error for missing variables', () => {
      const invalidData = { ...validStoryData, variables: undefined }
      expect(() => validateStoryData(invalidData)).toThrow('缺少变量定义 (variables)')
    })

    it('should throw error for missing nodes', () => {
      const invalidData = { ...validStoryData, nodes: undefined }
      expect(() => validateStoryData(invalidData)).toThrow('缺少节点定义 (nodes)')
    })

    it('should throw error for missing required metadata fields', () => {
      const invalidData = {
        ...validStoryData,
        metadata: { ...validStoryData.metadata, title: undefined }
      }
      expect(() => validateStoryData(invalidData)).toThrow('元数据缺少必需字段: title')
    })

    it('should throw error for non-existent index node', () => {
      const invalidData = {
        ...validStoryData,
        metadata: { ...validStoryData.metadata, indexNode: 'nonExistent' }
      }
      expect(() => validateStoryData(invalidData)).toThrow('起始节点 "nonExistent" 在节点列表中不存在')
    })

    it('should throw error for node without text', () => {
      const invalidData = {
        ...validStoryData,
        nodes: {
          start: { links: [] } as any
        }
      }
      expect(() => validateStoryData(invalidData)).toThrow('节点 "start" 缺少有效的文本内容')
    })

    it('should throw error for link to non-existent target', () => {
      const invalidData = {
        ...validStoryData,
        nodes: {
          start: {
            text: '起始节点',
            links: [{ text: '无效链接', target: 'nonExistent' }]
          }
        }
      }
      expect(() => validateStoryData(invalidData)).toThrow('节点 "start" 的链接指向不存在的目标节点: nonExistent')
    })
  })

  describe('exportToBandTwineJSON', () => {
    it('should export valid JSON string', () => {
      const jsonString = exportToBandTwineJSON(validStoryData)
      
      expect(jsonString).toBeTypeOf('string')
      
      const parsed = JSON.parse(jsonString)
      expect(parsed.metadata.title).toBe('测试故事')
      expect(parsed.nodes.start.text).toBe('起始节点')
    })

    it('should add releaseDate if missing', () => {
      const dataWithoutDate = {
        ...validStoryData,
        metadata: { ...validStoryData.metadata, releaseDate: undefined }
      }
      
      const jsonString = exportToBandTwineJSON(dataWithoutDate as any)
      const parsed = JSON.parse(jsonString)
      
      expect(parsed.metadata.releaseDate).toBeDefined()
    })

    it('should remove segments field from nodes', () => {
      const dataWithSegments = {
        ...validStoryData,
        nodes: {
          start: {
            text: '起始节点',
            links: [],
            segments: [{ type: 'text', tid: 'start-text-0', content: '起始节点' }]
          }
        }
      }
      
      const jsonString = exportToBandTwineJSON(dataWithSegments as any)
      const parsed = JSON.parse(jsonString)
      
      expect(parsed.nodes.start.segments).toBeUndefined()
      expect(parsed.nodes.start.text).toBe('起始节点')
    })

    it('should preserve show and temp variables', () => {
      const dataWithSpecialVars = {
        ...validStoryData,
        variables: {
          ...validStoryData.variables,
          show: {
            counter: { value: 0, desc: '计数器' },
            score: { value: 100, desc: '分数' }
          },
          temp: {
            calculation: { value: '', desc: '临时计算' }
          }
        }
      }
      
      const jsonString = exportToBandTwineJSON(dataWithSpecialVars as any)
      const parsed = JSON.parse(jsonString)
      
      expect(parsed.variables.show.counter.value).toBe(0)
      expect(parsed.variables.show.counter.desc).toBe('计数器')
      expect(parsed.variables.temp.calculation.desc).toBe('临时计算')
    })
  })

  describe('importFromBandTwineJSON', () => {
    it('should import valid JSON string', () => {
      const jsonString = JSON.stringify(validStoryData)
      const imported = importFromBandTwineJSON(jsonString)
      
      expect(imported.metadata.title).toBe('测试故事')
      expect(imported.nodes.start?.text).toBe('起始节点')
    })

    it('should throw error for invalid JSON', () => {
      expect(() => importFromBandTwineJSON('invalid json')).toThrow('无效的 JSON 格式')
    })

    it('should throw error for invalid story data', () => {
      const invalidJson = JSON.stringify({ invalid: 'data' })
      expect(() => importFromBandTwineJSON(invalidJson)).toThrow('缺少元数据 (metadata)')
    })
  })

  describe('exportProjectFile', () => {
    it('should export project file with editor state', () => {
      const nodePositions = { start: { x: 100, y: 100 } }
      const viewport = { x: 0, y: 0, zoom: 1 }
      
      const projectJson = exportProjectFile(validStoryData, nodePositions, viewport)
      const parsed = JSON.parse(projectJson)
      
      expect(parsed.storyData).toBeDefined()
      expect(parsed.editorState).toBeDefined()
      expect(parsed.editorState.nodePositions).toEqual(nodePositions)
      expect(parsed.editorState.viewport).toEqual(viewport)
    })
  })

  describe('importProjectFile', () => {
    it('should import project file', () => {
      const projectFile = {
        storyData: validStoryData,
        editorState: {
          nodePositions: { start: { x: 100, y: 100 } },
          viewport: { x: 0, y: 0, zoom: 1 }
        }
      }
      
      const jsonString = JSON.stringify(projectFile)
      const result = importProjectFile(jsonString)
      
      expect(result.storyData.metadata.title).toBe('测试故事')
      expect(result.nodePositions.start).toEqual({ x: 100, y: 100 })
      expect(result.viewport).toEqual({ x: 0, y: 0, zoom: 1 })
    })

    it('should import regular story data without editor state', () => {
      const jsonString = JSON.stringify(validStoryData)
      const result = importProjectFile(jsonString)
      
      expect(result.storyData.metadata.title).toBe('测试故事')
      expect(result.nodePositions).toEqual({})
      expect(result.viewport).toEqual({ x: 0, y: 0, zoom: 1 })
    })
  })

  describe('generateSampleStoryData', () => {
    it('should generate valid sample data', () => {
      const sampleData = generateSampleStoryData()
      
      expect(sampleData.metadata.title).toBe('示例故事')
      expect(sampleData.nodes.start).toBeDefined()
      expect(sampleData.variables.player).toBeDefined()
      
      // 验证数据格式
      expect(() => validateStoryData(sampleData)).not.toThrow()
    })
  })

  describe('downloadFile', () => {
    // 注意：downloadFile 函数依赖于 DOM API，在测试环境中可能无法完全测试
    it('should be defined as a function', () => {
      expect(typeof downloadFile).toBe('function')
    })
  })

  describe('readUploadedFile', () => {
    // 注意：FileReader API 在测试环境中可能无法完全测试
    it('should be defined as a function', () => {
      expect(typeof readUploadedFile).toBe('function')
    })
  })
})