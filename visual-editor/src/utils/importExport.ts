import type { StoryData, ProjectFile } from '@/types'

/**
 * 验证故事数据是否符合 BandTwine 格式
 */
export function validateStoryData(data: any): data is StoryData {
  if (!data || typeof data !== 'object') {
    throw new Error('无效的数据格式')
  }

  // 检查必需字段
  if (!data.metadata || typeof data.metadata !== 'object') {
    throw new Error('缺少元数据 (metadata)')
  }

  if (!data.variables || typeof data.variables !== 'object') {
    throw new Error('缺少变量定义 (variables)')
  }

  if (!data.nodes || typeof data.nodes !== 'object') {
    throw new Error('缺少节点定义 (nodes)')
  }

  // 检查元数据必需字段
  const requiredMetadataFields = ['title', 'author', 'version', 'versionCode', 'indexNode']
  for (const field of requiredMetadataFields) {
    if (!data.metadata[field]) {
      throw new Error(`元数据缺少必需字段: ${field}`)
    }
  }

  // 检查起始节点是否存在
  if (!data.nodes[data.metadata.indexNode]) {
    throw new Error(`起始节点 "${data.metadata.indexNode}" 在节点列表中不存在`)
  }

  // 检查节点结构
  for (const [nodeId, node] of Object.entries(data.nodes) as [string, any][]) {
    if (!node.text || typeof node.text !== 'string') {
      throw new Error(`节点 "${nodeId}" 缺少有效的文本内容`)
    }

    if (!Array.isArray(node.links)) {
      throw new Error(`节点 "${nodeId}" 的链接必须是数组`)
    }

    // 检查链接目标是否存在
    for (const link of node.links) {
      if (!link.target || !data.nodes[link.target]) {
        throw new Error(`节点 "${nodeId}" 的链接指向不存在的目标节点: ${link.target}`)
      }
    }
  }

  return true
}

/**
 * 导出为 BandTwine JSON 格式
 */
export function exportToBandTwineJSON(storyData: StoryData): string {
  // 创建深拷贝，移除编辑器特有的字段（如 segments）
  const exportData = {
    ...storyData,
    // 确保格式整洁
    metadata: {
      ...storyData.metadata,
      releaseDate: storyData.metadata.releaseDate || new Date().toISOString().split('T')[0]
    },
    nodes: { ...storyData.nodes }
  }
  
  // 移除每个节点中的 segments 字段（由编译脚本生成）
  for (const nodeId in exportData.nodes) {
    const node = exportData.nodes[nodeId]
    if (node?.segments) {
      delete node.segments
    }
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * 导入 BandTwine JSON 数据
 */
export function importFromBandTwineJSON(jsonString: string): StoryData {
  let data
  try {
    data = JSON.parse(jsonString)
  } catch (error) {
    throw new Error('无效的 JSON 格式')
  }

  // 验证数据
  validateStoryData(data)

  return data as StoryData
}

/**
 * 导出完整项目文件（包含编辑器状态）
 */
export function exportProjectFile(
  storyData: StoryData,
  nodePositions: Record<string, { x: number; y: number }>,
  viewport: { x: number; y: number; zoom: number }
): string {
  const projectFile: ProjectFile = {
    metadata: storyData.metadata,
    storyData,
    editorState: {
      nodePositions,
      viewport
    }
  }

  return JSON.stringify(projectFile, null, 2)
}

/**
 * 导入项目文件
 */
export function importProjectFile(jsonString: string): {
  storyData: StoryData
  nodePositions: Record<string, { x: number; y: number }>
  viewport: { x: number; y: number; zoom: number }
} {
  let data
  try {
    data = JSON.parse(jsonString)
  } catch (error) {
    throw new Error('无效的 JSON 格式')
  }

  // 检查是否为项目文件格式
  if (data.storyData) {
    validateStoryData(data.storyData)
    return {
      storyData: data.storyData as StoryData,
      nodePositions: data.editorState?.nodePositions || {},
      viewport: data.editorState?.viewport || { x: 0, y: 0, zoom: 1 }
    }
  } else {
    // 普通故事数据格式
    validateStoryData(data)
    return {
      storyData: data as StoryData,
      nodePositions: {},
      viewport: { x: 0, y: 0, zoom: 1 }
    }
  }
}

/**
 * 从现有 bandtwine_src 目录导入
 */
export async function importFromBandTwineSource(): Promise<StoryData> {
  // 这是一个占位函数，实际实现需要读取 bandtwine_src 目录
  // 并合并所有 JSON 文件，类似于 scripts/compile.js 的功能
  
  throw new Error('从 bandtwine_src 导入功能尚未实现')
}

/**
 * 导出到 bandtwine_src 目录
 */
export async function exportToBandTwineSource(_storyData: StoryData): Promise<void> {
  // 这是一个占位函数，实际实现需要将数据写入 bandtwine_src 目录
  
  throw new Error('导出到 bandtwine_src 功能尚未实现')
}

/**
 * 下载文件
 */
export function downloadFile(content: string, filename: string, type: string = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 读取上传的文件
 */
export function readUploadedFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * 生成示例故事数据
 */
export function generateSampleStoryData(): StoryData {
  return {
    metadata: {
      title: '示例故事',
      description: '这是一个 BandTwine 示例故事',
      author: 'BandTwine 编辑器',
      version: '1.0.0',
      versionCode: 1,
      releaseDate: new Date().toISOString().split('T')[0] || '',
      license: 'CC-0',
      copyright: 'Copyright © 2025 BandTwine',
      indexNode: 'start'
    },
    variables: {
      player: {
        name: {
          value: '玩家',
          desc: '玩家名称'
        },
        health: {
          value: 100,
          desc: '玩家生命值'
        }
      },
      world: {
        time: {
          value: 480,
          desc: '当前时间（分钟）'
        },
        day: {
          value: 1,
          desc: '当前天数'
        }
      }
    },
    nodes: {
      start: {
        text: '你醒来发现自己在一个陌生的房间中。\n\n窗外阳光明媚，鸟儿在歌唱。你感觉有些困惑，不知道自己为什么会在这里。\n\n{var.world.time}',
        links: [
          {
            text: '检查房间',
            target: 'checkRoom'
          },
          {
            text: '看向窗外',
            target: 'lookWindow'
          }
        ]
      },
      checkRoom: {
        text: '你仔细检查房间。房间里有一张床、一个书桌和一个衣柜。书桌上放着一本日记和一串钥匙。\n\n{var.player.health}',
        links: [
          {
            text: '打开日记',
            target: 'start'
          },
          {
            text: '拿起钥匙',
            target: 'start'
          },
          {
            text: '返回',
            target: 'start'
          }
        ]
      },
      lookWindow: {
        text: '你看向窗外，看到一个小花园。花园里有一位老人在修剪花草。',
        links: [
          {
            text: '挥手打招呼',
            target: 'start'
          },
          {
            text: '返回',
            target: 'start'
          }
        ]
      }
    }
  }
}