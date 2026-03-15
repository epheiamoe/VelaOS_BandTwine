<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { ref } from 'vue'

const editorStore = useEditorStore()

interface VariableItem {
  type: 'variable' | 'group'
  key: string
  path: string
  value?: any
  desc?: string
  level: number
  children?: VariableItem[]
}

// 新变量表单
const newVarPath = ref('')
const newVarValue = ref('')
const newVarDesc = ref('')

const addVariable = () => {
  if (!newVarPath.value.trim()) return
  
  editorStore.updateVariable(
    newVarPath.value.trim(),
    newVarValue.value,
    newVarDesc.value || undefined
  )
  
  // 清空表单
  newVarPath.value = ''
  newVarValue.value = ''
  newVarDesc.value = ''
}

// 递归渲染变量树
const renderVariables = (obj: any, path: string = '', level: number = 0): VariableItem[] => {
  const items: VariableItem[] = []
  
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    
    const currentPath = path ? `${path}.${key}` : key
    const value = obj[key]
    
    if (value && typeof value === 'object' && 'value' in value) {
      // 变量值对象
      items.push({
        type: 'variable',
        key,
        path: currentPath,
        value: value.value,
        desc: value.desc,
        level
      })
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // 嵌套对象
      items.push({
        type: 'group',
        key,
        path: currentPath,
        level,
        children: renderVariables(value, currentPath, level + 1)
      })
    }
  }
  
  return items
}

const variableItems = renderVariables(editorStore.storyData.variables)

// 分类变量：show, temp, other
const categorizedVariables = {
  show: renderVariables(editorStore.storyData.variables.show || {}),
  temp: renderVariables(editorStore.storyData.variables.temp || {}),
  other: renderVariables(Object.fromEntries(
    Object.entries(editorStore.storyData.variables)
      .filter(([key]) => key !== 'show' && key !== 'temp')
  ))
}

// 基础变量列表
const basicVariables = [
  { path: 'world.time', label: '世界时间（分钟）', example: '480 = 08:00' },
  { path: 'world.day', label: '当前天数', example: '从1开始' },
  { path: 'world.formattedTime', label: '格式化时间', example: '08:00' },
  { path: 'world.timePeriod', label: '时间段', example: '早晨、中午、晚上' },
  { path: 'player.name', label: '玩家名称', example: '默认"玩家"' },
  { path: 'player.level', label: '玩家等级', example: '从1开始' }
]

// 获取变量当前值
const getVariableValue = (path: string) => {
  const parts = path.split('.')
  let current: any = editorStore.storyData.variables
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
</script>

<template>
  <div class="space-y-6">
    <!-- 标题和统计 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">变量管理</h2>
        <p class="text-base-content/60 text-sm mt-1">
          定义游戏中使用的变量，可以在节点文本中通过 {var.path} 引用
        </p>
      </div>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">变量总数</div>
          <div class="stat-value text-primary">
            {{ variableItems.filter(item => item.type === 'variable').length }}
          </div>
        </div>
      </div>
    </div>

    <!-- 基础变量 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">基础变量</h3>
        <p class="text-base-content/60 text-sm mb-4">
          以下是系统预定义的基础变量，建议优先使用这些变量以保证兼容性。
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="basicVar in basicVariables"
            :key="basicVar.path"
            class="card bg-base-300"
          >
            <div class="card-body p-4">
              <h4 class="card-title text-sm font-medium">{{ basicVar.label }}</h4>
              <div class="text-xs text-base-content/60 mt-1">
                <code>{{ basicVar.path }}</code>
              </div>
              <div class="text-xs mt-2">
                {{ basicVar.example }}
              </div>
              <div class="mt-2">
                <div class="text-xs font-medium">当前值:</div>
                <div class="text-sm font-mono bg-base-200 rounded px-2 py-1 mt-1">
                  {{ getVariableValue(basicVar.path) ?? '未设置' }}
                </div>
              </div>
               <div class="card-actions justify-end mt-3">
                <button 
                  class="btn btn-xs btn-outline"
                  @click="newVarPath = basicVar.path; newVarValue = getVariableValue(basicVar.path) ?? ''; newVarDesc = ''"
                >
                  快速编辑
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">点击"快速编辑"按钮可以快速修改变量值，或直接在下方添加新变量。</span>
        </div>
      </div>
    </div>

    <!-- 添加新变量 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">添加新变量</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">变量路径</span>
            </label>
            <input
              v-model="newVarPath"
              type="text"
              class="input input-bordered"
              placeholder="如: player.health 或 world.time"
            >
            <label class="label">
              <span class="label-text-alt">使用点号分隔嵌套路径</span>
              <span class="label-text-alt text-info">使用 "show." 前缀创建显示变量，或 "temp." 创建临时变量</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">初始值</span>
            </label>
            <input
              v-model="newVarValue"
              type="text"
              class="input input-bordered"
              placeholder="初始值"
            >
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">描述（可选）</span>
            </label>
            <input
              v-model="newVarDesc"
              type="text"
              class="input input-bordered"
              placeholder="变量描述"
            >
          </div>
        </div>
        
        <div class="card-actions justify-end mt-4">
          <button class="btn btn-primary" @click="addVariable">
            添加变量
          </button>
        </div>
      </div>
    </div>

    <!-- 变量分类列表 -->
    <div class="space-y-6">
      <!-- 显示变量 (show) -->
      <div class="card bg-base-200 shadow" v-if="categorizedVariables.show.length > 0">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info inline mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            显示变量 (show)
          </h3>
          <p class="text-sm text-base-content/60 mb-4">这些变量会在游戏侧边栏中显示，通常用于状态指示。</p>
          
          <div class="space-y-2">
            <div 
              v-for="item in categorizedVariables.show"
              :key="item.path"
              class="collapse collapse-arrow border border-base-300"
              :class="item.type === 'group' ? 'collapse-open' : ''"
            >
              <input type="checkbox" :checked="item.type === 'group'" />
              <div class="collapse-title font-medium flex items-center">
                <div 
                  class="flex items-center gap-2"
                  :style="{ marginLeft: `${item.level * 1.5}rem` }"
                >
                  <svg 
                    v-if="item.type === 'group'"
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-primary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <svg 
                    v-else
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-secondary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ item.key }}</span>
                  <span v-if="item.type === 'variable'" class="text-xs font-normal opacity-60">
                    ({{ typeof item.value }})
                  </span>
                </div>
              </div>
              
              <div v-if="item.type === 'group'" class="collapse-content">
                <div v-if="!item.children || item.children.length === 0" class="text-base-content/50 text-sm p-2">
                  空文件夹
                </div>
                <div v-else>
                  <!-- 嵌套内容会在外层循环中渲染 -->
                </div>
              </div>
              
              <div v-else class="collapse-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">路径</span>
                    </label>
                    <div class="input input-bordered bg-base-300">{{ item.path }}</div>
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">当前值</span>
                    </label>
                    <div class="input input-bordered">
                      {{ item.value }}
                    </div>
                  </div>
                  
                  <div v-if="item.desc" class="form-control col-span-full">
                    <label class="label">
                      <span class="label-text">描述</span>
                    </label>
                    <div class="input input-bordered bg-base-300">{{ item.desc }}</div>
                  </div>
                </div>
                
                <div class="flex justify-end gap-2 mt-4">
                  <button class="btn btn-sm btn-outline">
                    编辑
                  </button>
                  <button class="btn btn-sm btn-error btn-outline">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 临时变量 (temp) -->
      <div class="card bg-base-200 shadow" v-if="categorizedVariables.temp.length > 0">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning inline mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
            </svg>
            临时变量 (temp)
          </h3>
          <p class="text-sm text-base-content/60 mb-4">这些变量不会保存到游戏存档中，通常用于临时计算。</p>
          
          <div class="space-y-2">
            <div 
              v-for="item in categorizedVariables.temp"
              :key="item.path"
              class="collapse collapse-arrow border border-base-300"
              :class="item.type === 'group' ? 'collapse-open' : ''"
            >
              <input type="checkbox" :checked="item.type === 'group'" />
              <div class="collapse-title font-medium flex items-center">
                <div 
                  class="flex items-center gap-2"
                  :style="{ marginLeft: `${item.level * 1.5}rem` }"
                >
                  <svg 
                    v-if="item.type === 'group'"
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-primary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <svg 
                    v-else
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-secondary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ item.key }}</span>
                  <span v-if="item.type === 'variable'" class="text-xs font-normal opacity-60">
                    ({{ typeof item.value }})
                  </span>
                </div>
              </div>
              
              <div v-if="item.type === 'group'" class="collapse-content">
                <div v-if="!item.children || item.children.length === 0" class="text-base-content/50 text-sm p-2">
                  空文件夹
                </div>
                <div v-else>
                  <!-- 嵌套内容会在外层循环中渲染 -->
                </div>
              </div>
              
              <div v-else class="collapse-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">路径</span>
                    </label>
                    <div class="input input-bordered bg-base-300">{{ item.path }}</div>
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">当前值</span>
                    </label>
                    <div class="input input-bordered">
                      {{ item.value }}
                    </div>
                  </div>
                  
                  <div v-if="item.desc" class="form-control col-span-full">
                    <label class="label">
                      <span class="label-text">描述</span>
                    </label>
                    <div class="input input-bordered bg-base-300">{{ item.desc }}</div>
                  </div>
                </div>
                
                <div class="flex justify-end gap-2 mt-4">
                  <button class="btn btn-sm btn-outline">
                    编辑
                  </button>
                  <button class="btn btn-sm btn-error btn-outline">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他变量 -->
      <div class="card bg-base-200 shadow" v-if="categorizedVariables.other.length > 0">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success inline mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            其他变量
          </h3>
          <p class="text-sm text-base-content/60 mb-4">普通变量，用于游戏逻辑和存储数据。</p>
          
          <div class="space-y-2">
            <div 
              v-for="item in categorizedVariables.other"
              :key="item.path"
              class="collapse collapse-arrow border border-base-300"
              :class="item.type === 'group' ? 'collapse-open' : ''"
            >
              <input type="checkbox" :checked="item.type === 'group'" />
              <div class="collapse-title font-medium flex items-center">
                <div 
                  class="flex items-center gap-2"
                  :style="{ marginLeft: `${item.level * 1.5}rem` }"
                >
                  <svg 
                    v-if="item.type === 'group'"
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-primary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <svg 
                    v-else
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-5 w-5 text-secondary" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ item.key }}</span>
                  <span v-if="item.type === 'variable'" class="text-xs font-normal opacity-60">
                    ({{ typeof item.value }})
                  </span>
                </div>
              </div>
              
              <div v-if="item.type === 'group'" class="collapse-content">
                <div v-if="!item.children || item.children.length === 0" class="text-base-content/50 text-sm p-2">
                  空文件夹
                </div>
                <div v-else>
                  <!-- 嵌套内容会在外层循环中渲染 -->
                </div>
              </div>
              
              <div v-else class="collapse-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">路径</span>
                    </label>
                    <div class="input input-bordered bg-base-300">{{ item.path }}</div>
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">当前值</span>
                    </label>
                    <div class="input input-bordered">
                      {{ item.value }}
                    </div>
                  </div>
                  
                  <div v-if="item.desc" class="form-control col-span-full">
                    <label class="label">
                      <span class="label-text">描述</span>
                    </label>
                    <div class="input input-bordered bg-base-300">{{ item.desc }}</div>
                  </div>
                </div>
                
                <div class="flex justify-end gap-2 mt-4">
                  <button class="btn btn-sm btn-outline">
                    编辑
                  </button>
                  <button class="btn btn-sm btn-error btn-outline">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 无变量提示 -->
      <div v-if="variableItems.length === 0" class="card bg-base-200 shadow">
        <div class="card-body">
          <h3 class="card-title text-lg mb-4">变量列表</h3>
          <div class="text-center py-8 text-base-content/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>暂无变量</p>
            <p class="text-sm mt-1">添加上方变量以开始使用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用示例 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">使用示例</h3>
        <div class="space-y-3">
          <div>
            <p class="font-medium">在节点文本中引用变量：</p>
            <div class="mockup-code mt-2">
              <pre><code>当前时间：{var.world.formattedTime}</code></pre>
              <pre><code>玩家等级：{var.player.level.value}</code></pre>
            </div>
          </div>
          
          <div>
            <p class="font-medium">在条件中使用：</p>
            <div class="mockup-code mt-2">
              <pre><code>条件: var.player.level.value > 5</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>