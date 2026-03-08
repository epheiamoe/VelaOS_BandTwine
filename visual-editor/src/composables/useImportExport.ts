import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import {
  exportToBandTwineJSON,
  importFromBandTwineJSON,
  exportProjectFile,
  importProjectFile,
  downloadFile,
  readUploadedFile,
  generateSampleStoryData,
  validateStoryData
} from '@/utils/importExport'
import type { StoryData } from '@/types'

export function useImportExport() {
  const editorStore = useEditorStore()
  const isImporting = ref(false)
  const errorMessage = ref<string | null>(null)

  /**
   * 导出为 BandTwine JSON 文件
   */
  const exportAsJSON = () => {
    try {
      const jsonData = exportToBandTwineJSON(editorStore.storyData)
      const filename = `${editorStore.storyData.metadata.title.replace(/\s+/g, '_')}_${Date.now()}.json`
      downloadFile(jsonData, filename)
    } catch (error) {
      errorMessage.value = `导出失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  /**
   * 导出完整项目文件
   */
  const exportProject = () => {
    try {
      const projectData = exportProjectFile(
        editorStore.storyData,
        editorStore.nodePositions,
        editorStore.viewport
      )
      const filename = `${editorStore.storyData.metadata.title.replace(/\s+/g, '_')}_project_${Date.now()}.bandtwine`
      downloadFile(projectData, filename)
    } catch (error) {
      errorMessage.value = `导出项目失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  /**
   * 导入 JSON 文件
   */
  const importJSON = async (file: File) => {
    isImporting.value = true
    errorMessage.value = null

    try {
      const content = await readUploadedFile(file)
      const data = importFromBandTwineJSON(content)
      editorStore.importStoryData(data)
    } catch (error) {
      errorMessage.value = `导入失败: ${error instanceof Error ? error.message : '未知错误'}`
      throw error
    } finally {
      isImporting.value = false
    }
  }

  /**
   * 导入项目文件
   */
  const importProject = async (file: File) => {
    isImporting.value = true
    errorMessage.value = null

    try {
      const content = await readUploadedFile(file)
      const { storyData, nodePositions, viewport } = importProjectFile(content)
      
      editorStore.importStoryData(storyData)
      
      // 恢复编辑器状态
      Object.assign(editorStore.nodePositions, nodePositions)
      Object.assign(editorStore.viewport, viewport)
    } catch (error) {
      errorMessage.value = `导入项目失败: ${error instanceof Error ? error.message : '未知错误'}`
      throw error
    } finally {
      isImporting.value = false
    }
  }

  /**
   * 处理文件上传
   */
  const handleFileUpload = (event: Event, isProjectFile: boolean = false) => {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    // 检查文件类型
    if (!['json', 'bandtwine'].includes(fileExtension || '')) {
      errorMessage.value = '请选择 JSON 或 .bandtwine 文件'
      return
    }

    if (isProjectFile || fileExtension === 'bandtwine') {
      importProject(file)
    } else {
      importJSON(file)
    }

    // 清空 input 以便再次选择同一文件
    input.value = ''
  }

  /**
   * 加载示例数据
   */
  const loadSampleData = () => {
    try {
      const sampleData = generateSampleStoryData()
      editorStore.importStoryData(sampleData)
    } catch (error) {
      errorMessage.value = `加载示例失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async () => {
    try {
      const jsonData = exportToBandTwineJSON(editorStore.storyData)
      await navigator.clipboard.writeText(jsonData)
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea')
      const jsonData = exportToBandTwineJSON(editorStore.storyData)
      textArea.value = jsonData
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  /**
   * 从剪贴板导入
   */
  const importFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const data = importFromBandTwineJSON(text)
      editorStore.importStoryData(data)
    } catch (error) {
      errorMessage.value = `从剪贴板导入失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  return {
    isImporting,
    errorMessage,
    exportAsJSON,
    exportProject,
    importJSON,
    importProject,
    handleFileUpload,
    loadSampleData,
    copyToClipboard,
    importFromClipboard
  }
}