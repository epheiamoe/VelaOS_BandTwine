// BandTwine 故事数据类型定义

export interface Metadata {
  title: string
  description: string
  author: string
  version: string
  versionCode: number
  releaseDate: string
  license: string
  copyright: string
  indexNode: string
}

export interface VariableValue {
  value: any
  desc?: string
}

export type Variables = {
  [key: string]: string | number | boolean | null | VariableValue | Variables
}

export interface Action {
  type: 'add' | 'set' | 'toggle' | 'vibrate' | 'addListener' | 'removeListener' | 'autosave' | 'advanceTime' | 'toast' | 'jump'
  target?: string
  value?: any
  mode?: string
  id?: string
  condition?: string
  actions?: Action[]
  beforeActions?: Action[]
  afterActions?: Action[]
  minutes?: number
  message?: string
  duration?: number
  options?: Record<string, any>
}

export interface Link {
  text: string
  target: string
  actions?: Action[]
}

export interface ConditionOption {
  condition?: string
  text: string
}

export interface RandomOption {
  text: string
  weight?: number
  condition?: string
}

export interface ImageDef {
  path: string
  width: number
}

export type SegmentType = 'text' | 'newline' | 'variable' | 'condition' | 'random' | 'image' | 'expression' | 'link'

export interface Segment {
  type: SegmentType
  tid: string
  [key: string]: any
}

export interface Node {
  text: string
  links: Link[]
  actions?: Action[]
  conds?: Record<string, ConditionOption[]>
  randoms?: Record<string, RandomOption[]>
  imgs?: Record<string, ImageDef>
  // 编译后的字段
  segments?: Segment[]
}

export interface StoryData {
  metadata: Metadata
  variables: Variables
  nodes: Record<string, Node>
}

// 可视化编辑器特定的类型
export interface VisualNode {
  id: string
  type: 'start' | 'normal' | 'branch' | 'action'
  position: { x: number; y: number }
  data: Node
}

export interface VisualLink {
  id: string
  source: string
  target: string
  label?: string
  data: Link
}

// 编辑器状态
export interface EditorState {
  storyData: StoryData
  selectedNodeId: string | null
  selectedLinkId: string | null
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

// 导入/导出格式
export interface ProjectFile {
  metadata: Metadata
  storyData: StoryData
  editorState?: {
    nodePositions: Record<string, { x: number; y: number }>
    viewport: EditorState['viewport']
  }
}