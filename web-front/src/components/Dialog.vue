<!-- src/components/ChatPanel.vue -->
<template>
  <div class="chat-panel">
    <!-- 消息区域 -->
    <div class="messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="{ 'from-user': msg.role === 'user', 'from-ai': msg.role === 'ai' }"
      >
        <div class="message-bubble">{{ msg.content }}</div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="sendMessage"
        placeholder="请输入消息..."
        rows="2"
      ></textarea>
      <button @click="sendMessage" :disabled="!inputText.trim()">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Message {
  role: 'user' | 'ai'
  content: string
}

const props = defineProps<{
  messages: Message[]
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
}>()

const inputText = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

// 自动滚动到底部
watch(() => props.messages, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}, { deep: true, immediate: true })

import { nextTick } from 'vue'
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 360px;
  border-right: 1px solid #eee;
  background: #fafafa;
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  justify-content: flex-start;
}

.message.from-user {
  justify-content: flex-end;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  word-break: break-word;
}

.message.from-ai .message-bubble {
  background: #e0f7fa;
  border-bottom-left-radius: 4px;
}

.message.from-user .message-bubble {
  background: #c8e6c9;
  border-bottom-right-radius: 4px;
}

.input-area {
  padding: 12px;
  border-top: 1px solid #eee;
  background: white;
  display: flex;
  gap: 8px;
}

.input-area textarea {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: none;
}

.input-area button {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
</style>