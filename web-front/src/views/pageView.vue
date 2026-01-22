<!-- src/views/HomeView.vue -->
<template>
  <div class="page-layout">
    <!-- 左侧聊天面板 -->
    <Dialog
      :messages="messages"
      @send="handleSend"
    />

    <!-- 右侧主内容区 -->
    <div class="main-content">
      <h2>主内容区域</h2>
      <p>你可以在这里放地图、图表、表单等内容。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '@/components/Dialog.vue'

interface Message {
  role: 'user' | 'ai'
  content: string
}

const messages = ref<Message[]>([
  { role: 'ai', content: '你好！我是 AI 助手，有什么可以帮您？' }
])

const handleSend = async (content: string) => {
  // 添加用户消息
  messages.value.push({ role: 'user', content })

  // 模拟 AI 回复（实际可调用 API）
  setTimeout(() => {
    messages.value.push({ role: 'ai', content: `你刚才说：“${content}”，我会认真思考！` })
  }, 800)
}
</script>

<style scoped>
.page-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 24px;
  background: #f5f5f5;
}
</style>