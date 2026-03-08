// BandTwine 文本编译工具 (浏览器端实现)
// 基于 scripts/compile.js 中的 compileText 函数

export type SegmentType = 'text' | 'newline' | 'variable' | 'condition' | 'random' | 'image' | 'expression' | 'link'

export interface Segment {
  type: SegmentType
  tid: string  // 唯一标识符 (nodeId-type-counter)
  [key: string]: any
}

/**
 * 解析包含标记的文本，并将其转换为结构化的指令数组。
 * @param text - 包含标记的原始文本。
 * @param nodeId - 当前节点的ID，用于生成全局唯一的tid。
 * @returns 代表渲染指令的 segment 对象数组。
 */
export function compileText(text: string, nodeId: string): Segment[] {
  if (typeof text !== 'string' || !text) {
    return []
  }

  const segments: Segment[] = []
  const regex = /(\{\w+\.?[\w.]*\}|\n|\$\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let segmentCounter = 0

  const createSegment = (type: SegmentType, data: Record<string, any> = {}): Segment => {
    const tid = `${nodeId}-${type}-${segmentCounter++}`
    return { type, tid, ...data }
  }

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(createSegment('text', { content: text.substring(lastIndex, match.index) }))
    }

    const matched = match[0]
    if (matched === '\n') {
      segments.push(createSegment('newline', {}))
    } else if (matched.startsWith('{var.')) {
      segments.push(createSegment('variable', { path: matched.slice(5, -1) }))
    } else if (matched.startsWith('{cond.')) {
      segments.push(createSegment('condition', { id: matched.slice(6, -1) }))
    } else if (matched.startsWith('{random.')) {
      segments.push(createSegment('random', { id: matched.slice(8, -1) }))
    } else if (matched.startsWith('{img.')) {
      segments.push(createSegment('image', { id: matched.slice(5, -1) }))
    } else if (matched.startsWith('$(')) {
      segments.push(createSegment('expression', { code: matched.slice(2, -1) }))
    } else if (/^\{\d+\}$/.test(matched)) {
      segments.push(createSegment('link', { index: parseInt(matched.slice(1, -1), 10) }))
    } else {
      segments.push(createSegment('text', { content: matched }))
    }
    lastIndex = match.index + matched.length
  }

  if (lastIndex < text.length) {
    segments.push(createSegment('text', { content: text.substring(lastIndex) }))
  }
  return segments
}

/**
 * 编译单个节点，为其 text 字段生成 segments。
 */
export function compileNode(nodeId: string, nodeText: string): Segment[] {
  return compileText(nodeText, nodeId)
}

/**
 * 批量编译所有节点，并返回新的节点数据（包含 segments 字段）。
 */
export function compileAllNodes(nodes: Record<string, { text: string }>): Record<string, { text: string; segments: Segment[] }> {
  const compiled: Record<string, { text: string; segments: Segment[] }> = {}
  for (const [id, node] of Object.entries(nodes)) {
    compiled[id] = {
      ...node,
      segments: compileText(node.text, id)
    }
  }
  return compiled
}

/**
 * 预览函数：给定节点文本和变量值，返回渲染后的文本（用于实时预览）。
 * 注意：目前只处理变量替换，条件、随机等需要运行时环境，预览时用占位符表示。
 */
export function previewText(text: string, variables: Record<string, any> = {}, conds: Record<string, any[]> = {}): string {
  // 简单实现：将 {var.x} 替换为变量值
  let result = text
  const varRegex = /\{var\.([\w.]+)\}/g
   result = result.replace(varRegex, (_match, path) => {
    const value = getVariableValue(variables, path)
    return value !== undefined ? String(value) : `{var.${path}}`
  })
  // 将 {cond.x} 替换为 [条件 x (n个选项)]
   result = result.replace(/\{cond\.(\w+)\}/g, (_match, id) => {
    const options = conds[id]
    const count = options?.length || 0
    return `[条件 ${id}${count > 0 ? ` (${count}个选项)` : ''}]`
  })
  // 将 {random.x} 替换为 [随机 $1]
  result = result.replace(/\{random\.(\w+)\}/g, '[随机 $1]')
  // 将 {img.x} 替换为 [图片 $1]
  result = result.replace(/\{img\.(\w+)\}/g, '[图片 $1]')
  // 将 $(expr) 替换为 [表达式]
  result = result.replace(/\$\(([^)]+)\)/g, '[表达式 $1]')
  // 将 {数字} 替换为 [链接 数字]
  result = result.replace(/\{(\d+)\}/g, '[链接 $1]')
  return result
}

/**
 * 递归获取嵌套变量值。
 */
function getVariableValue(variables: Record<string, any>, path: string): any {
  const parts = path.split('.')
  let current: any = variables
  for (let i = 0; i < parts.length; i++) {
     const part = parts[i]!
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
      // 如果是最后一个部分且当前是 VariableValue 对象，则取其 value
      if (i === parts.length - 1 && current && typeof current === 'object' && 'value' in current) {
        current = current.value
      }
    } else {
      return undefined
    }
  }
  return current
}