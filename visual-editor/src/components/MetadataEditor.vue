<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { computed } from 'vue'

const editorStore = useEditorStore()
const metadata = computed(() => editorStore.storyData.metadata)

const updateMetadata = (field: keyof typeof metadata.value, value: any) => {
  editorStore.storyData.metadata = {
    ...metadata.value,
    [field]: value
  }
}

const updateIndexNode = (nodeId: string) => {
  if (editorStore.storyData.nodes[nodeId]) {
    updateMetadata('indexNode', nodeId)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 标题和统计 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">项目设置</h2>
        <p class="text-base-content/60 text-sm mt-1">
          配置故事的基本信息和元数据
        </p>
      </div>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">版本</div>
          <div class="stat-value text-primary">
            {{ metadata.version }}
          </div>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">基本信息</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">故事标题</span>
            </label>
            <input
              :value="metadata.title"
              @input="updateMetadata('title', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input input-bordered"
              placeholder="输入故事标题"
            >
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">故事描述</span>
            </label>
            <textarea
              :value="metadata.description"
              @input="updateMetadata('description', ($event.target as HTMLInputElement).value)"
              class="textarea textarea-bordered h-24"
              placeholder="输入故事描述"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">作者</span>
              </label>
              <input
                :value="metadata.author"
                @input="updateMetadata('author', ($event.target as HTMLInputElement).value)"
                type="text"
                class="input input-bordered"
                placeholder="作者名称"
              >
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">发布日期</span>
              </label>
              <input
                :value="metadata.releaseDate"
                @input="updateMetadata('releaseDate', ($event.target as HTMLInputElement).value)"
                type="date"
                class="input input-bordered"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">版本信息</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">版本号</span>
            </label>
            <input
              :value="metadata.version"
              @input="updateMetadata('version', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input input-bordered"
              placeholder="如: 1.0.0"
            >
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">版本代码</span>
            </label>
            <input
              :value="metadata.versionCode"
              @input="updateMetadata('versionCode', parseInt(($event.target as HTMLInputElement).value) || 1)"
              type="number"
              class="input input-bordered"
              placeholder="整数版本代码"
              min="1"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 法律信息 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">法律信息</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">许可证</span>
            </label>
            <select
              :value="metadata.license"
              @change="updateMetadata('license', ($event.target as HTMLSelectElement).value)"
              class="select select-bordered"
            >
              <option value="CC-0">CC-0（公共领域）</option>
              <option value="CC-BY">CC BY（署名）</option>
              <option value="CC-BY-SA">CC BY-SA（署名-相同方式共享）</option>
              <option value="CC-BY-NC">CC BY-NC（署名-非商业性使用）</option>
              <option value="CC-BY-NC-SA">CC BY-NC-SA（署名-非商业性使用-相同方式共享）</option>
              <option value="CC-BY-ND">CC BY-ND（署名-禁止演绎）</option>
              <option value="CC-BY-NC-ND">CC BY-NC-ND（署名-非商业性使用-禁止演绎）</option>
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache 2.0</option>
              <option value="GPL-3.0">GPL 3.0</option>
              <option value="AGPL-3.0">AGPL 3.0</option>
              <option value="Proprietary">专有版权</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">版权声明</span>
            </label>
            <input
              :value="metadata.copyright"
              @input="updateMetadata('copyright', ($event.target as HTMLInputElement).value)"
              type="text"
              class="input input-bordered"
              placeholder="如: Copyright © 2025 作者名称"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 起始节点设置 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">起始节点设置</h3>
        <p class="text-sm text-base-content/60 mb-4">
          选择故事开始时的第一个节点
        </p>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">起始节点</span>
          </label>
          <select
            :value="metadata.indexNode"
            @change="updateIndexNode(($event.target as HTMLSelectElement).value)"
            class="select select-bordered"
          >
            <option 
              v-for="nodeId in Object.keys(editorStore.storyData.nodes)"
              :key="nodeId"
              :value="nodeId"
              :selected="nodeId === metadata.indexNode"
            >
              {{ nodeId }}
            </option>
          </select>
          <label class="label">
            <span class="label-text-alt">故事将从这个节点开始运行</span>
          </label>
        </div>
        
        <div v-if="metadata.indexNode && editorStore.storyData.nodes[metadata.indexNode]" class="mt-4">
          <div class="alert alert-info">
            <div>
              <span>当前起始节点：</span>
              <span class="font-bold">{{ metadata.indexNode }}</span>
            </div>
            <div class="text-sm mt-1 opacity-75">
              {{ editorStore.storyData.nodes[metadata.indexNode].text.substring(0, 100) }}
              {{ editorStore.storyData.nodes[metadata.indexNode].text.length > 100 ? '...' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目统计 -->
    <div class="card bg-base-200 shadow">
      <div class="card-body">
        <h3 class="card-title text-lg">项目统计</h3>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat">
            <div class="stat-title">总节点数</div>
            <div class="stat-value text-primary">
              {{ Object.keys(editorStore.storyData.nodes).length }}
            </div>
          </div>
          
          <div class="stat">
            <div class="stat-title">总链接数</div>
            <div class="stat-value text-secondary">
              {{
                Object.values(editorStore.storyData.nodes)
                  .reduce((total, node) => total + node.links.length, 0)
              }}
            </div>
          </div>
          
          <div class="stat">
            <div class="stat-title">变量组数</div>
            <div class="stat-value text-accent">
              {{ Object.keys(editorStore.storyData.variables).length }}
            </div>
          </div>
          
          <div class="stat">
            <div class="stat-title">版本</div>
            <div class="stat-value">
              {{ metadata.versionCode }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-4">
      <button class="btn btn-outline">
        导出配置
      </button>
      <button class="btn btn-primary">
        保存项目
      </button>
    </div>
  </div>
</template>