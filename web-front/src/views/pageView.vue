<!-- src/views/HomeView.vue -->
<template>
  <div class="page-layout">
    <!-- 左侧聊天面板 -->
    <Dialog
      :messages="messages"
      :loading="isLoading"
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
import axios from 'axios'
import { ROUTES } from '@/api/config.ts'

interface Message {
  role: 'user' | 'ai'
  content: string
}

const isLoading = ref(false)

const messages = ref<Message[]>([
  { role: 'ai', content: '你好！我是 AI 助手，有什么可以帮您？' }
])

const handleSend = async (content: string) => {
  // 添加用户消息
  messages.value.push({ role: 'user', content })

  // 显示加载状态
  isLoading.value = true

  try {
    // 调用后端 API
    const aiReply = await axios.post(ROUTES.HELLO, { message: content }).then(res => res.data.message)
    
    // 添加 AI 回复
    messages.value.push({ role: 'ai', content: aiReply })
  } catch (error) {
    console.error('AI 请求失败:', error)
    messages.value.push({
      role: 'ai',
      content: '抱歉，服务器暂时无法响应，请稍后再试。'
    })
  } finally {
    isLoading.value = false
  }

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