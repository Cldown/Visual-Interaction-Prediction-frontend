<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import * as d3 from 'd3'

// ========== 响应式状态 ==========
const messages = ref<Array<{ text: string; isUser: boolean }>>([])
const userInput = ref('')
const currentChartType = ref<'bar' | 'line' | 'map'>('bar')
const currentIntent = ref<string>('无')
const chatHistory = ref<Array<{ user: string; bot: string; intent: string }>>([])

// DOM 引用（通过模板中的 ref 绑定）
const chatMessages = ref<HTMLElement | null>(null)
const chartContainer = ref<HTMLElement | null>(null)

// ========== 计算属性 ==========
const statusText = computed(() => `状态: 已接收用户输入 | 意图: ${currentIntent.value}`)

// ========== 示例数据 ==========
const barData = [
  { name: '产品A', value: 45 },
  { name: '产品B', value: 56 },
  { name: '产品C', value: 38 },
  { name: '产品D', value: 72 },
  { name: '产品E', value: 63 }
]

const lineData = [
  { date: '2023-01', value: 30 },
  { date: '2023-02', value: 45 },
  { date: '2023-03', value: 50 },
  { date: '2023-04', value: 65 },
  { date: '2023-05', value: 58 },
  { date: '2023-06', value: 70 }
]

const countryData = [
  { code: 'CN', name: '中国', value: 1400 },
  { code: 'US', name: '美国', value: 330 },
  { code: 'IN', name: '印度', value: 1380 },
  { code: 'JP', name: '日本', value: 126 },
  { code: 'BR', name: '巴西', value: 213 }
]

const countryCenters: Record<string, [number, number]> = {
  CN: [104.1954, 35.8617],
  US: [-95.7129, 37.0902],
  IN: [78.9629, 20.5937],
  JP: [138.2529, 36.2048],
  BR: [-51.9253, -14.235]
}

// ========== 初始化 ==========
const initChat = () => {
  messages.value.push({
    text: '你好！我是分析助手。你可以告诉我你想分析什么数据，或者对图表进行交互操作。',
    isUser: false
  })
}

// ========== 消息管理 ==========
const addMessage = (text: string, isUser = false) => {
  messages.value.push({ text, isUser })
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

const processUserMessage = (message: string) => {
  let response = ''
  let intent = '探索性分析'

  if (message.includes('原因') || message.includes('为什么') || message.includes('下降')) {
    intent = '根因分析'
    response = '我理解您想分析销售下降的原因。我已经切换到折线图以更好地观察趋势变化。'
    switchToLineChart()
  } else if (message.includes('比较') || message.includes('对比')) {
    intent = '比较分析'
    response = '您想进行比较分析。我已为您准备了柱状图来展示不同产品的表现。'
    switchToBarChart()
  } else if (message.includes('趋势') || message.includes('走势')) {
    intent = '趋势分析'
    response = '您关心趋势变化。我已为您加载折线图。'
    switchToLineChart()
  } else if (message.includes('人口') || message.includes('国家') || message.includes('地图')) {
    intent = '地理分析'
    response = '您想查看地理分布。我已为您切换到世界地图视图。'
    switchToMap()
  } else {
    response = '我已收到您的请求。正在为您准备相关分析视图。'
  }

  addMessage(response)
  currentIntent.value = intent
  chatHistory.value.push({ user: message, bot: response, intent })
}

const sendMessage = () => {
  const msg = userInput.value.trim()
  if (!msg) return
  addMessage(msg, true)
  userInput.value = ''
  processUserMessage(msg)
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// ========== 图表渲染 ==========
const renderBarChart = () => {
  if (!chartContainer.value) return
  d3.select(chartContainer.value).selectAll('*').remove()

  const container = chartContainer.value
  const margin = { top: 20, right: 30, bottom: 40, left: 60 }
  const width = container.clientWidth - margin.left - margin.right
  const height = container.clientHeight - margin.top - margin.bottom

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scaleBand().rangeRound([0, width]).padding(0.1).domain(barData.map(d => d.name))
  const y = d3.scaleLinear().rangeRound([height, 0]).domain([0, d3.max(barData, d => d.value)!])

  g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
  g.append('g').call(d3.axisLeft(y)).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '0.71em').attr('text-anchor', 'end').text('数值')

  g.selectAll('.bar')
    .data(barData)
    .enter()
    .append('rect')
    .attr('x', d => x(d.name)!)
    .attr('y', d => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.value))
    .attr('fill', '#4a90e2')
    .on('click', (_, d) => {
      addMessage(`用户点击了柱状图中的"${d.name}"，值为${d.value}。这可能表示您关注此产品的表现。`, true)
      addMessage(`收到您的交互。您点击了"${d.name}"，这可能表明您想深入分析该产品。`, false)
      currentIntent.value = '产品关注'
    })
}

const renderLineChart = () => {
  if (!chartContainer.value) return
  d3.select(chartContainer.value).selectAll('*').remove()

  const container = chartContainer.value
  const margin = { top: 20, right: 30, bottom: 40, left: 60 }
  const width = container.clientWidth - margin.left - margin.right
  const height = container.clientHeight - margin.top - margin.bottom

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const x = d3.scalePoint().rangeRound([0, width]).padding(0.5).domain(lineData.map(d => d.date))
  const y = d3.scaleLinear().rangeRound([height, 0]).domain([0, d3.max(lineData, d => d.value)!])

  const line = d3.line<{ date: string; value: number }>()
    .x(d => x(d.date)!)
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX)

  g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x))
  g.append('g').call(d3.axisLeft(y)).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '0.71em').attr('text-anchor', 'end').text('数值')

  g.append('path')
    .datum(lineData)
    .attr('fill', 'none')
    .attr('stroke', '#4a90e2')
    .attr('stroke-width', 2)
    .attr('d', line)

  g.selectAll('.dot')
    .data(lineData)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.date)!)
    .attr('cy', d => y(d.value))
    .attr('r', 5)
    .attr('fill', '#e74c3c')
    .on('click', (_, d) => {
      addMessage(`用户点击了折线图中的"${d.date}"，值为${d.value}。这可能表示您想分析该时间点的趋势变化。`, true)
      addMessage(`收到您的交互。您点击了"${d.date}"，这可能表明您想分析该时间点的变化。`, false)
      currentIntent.value = '时间点分析'
    })
}

const renderWorldMap = () => {
  if (!chartContainer.value) return
  d3.select(chartContainer.value).selectAll('*').remove()

  const container = chartContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height)

  // === 修复：正确渲染地球背景 ===
  const orthoProjection = d3.geoOrthographic()
    .scale(width / 3)
    .translate([width / 2, height / 2])

  const path = d3.geoPath().projection(orthoProjection)

  svg.append('path')
    .datum({ type: 'Sphere' } as d3.GeoSphere) // 👈 关键修复
    .attr('d', path) // 👈 传函数，不是调用结果
    .attr('fill', '#f0f0f0')
    .attr('stroke', '#ccc')

  const projection = d3.geoMercator().scale(100).translate([width / 2, height / 2])
  const maxValue = d3.max(countryData, d => d.value)!
  const radiusScale = d3.scaleSqrt().domain([0, maxValue]).range([5, 20])

  svg
    .selectAll('.country-circle')
    .data(countryData)
    .enter()
    .append('circle')
    .attr('cx', d => {
      const coords = countryCenters[d.code]
      return coords ? projection(coords)![0] : 0
    })
    .attr('cy', d => {
      const coords = countryCenters[d.code]
      return coords ? projection(coords)![1] : 0
    })
    .attr('r', d => radiusScale(d.value))
    .attr('fill', d => d3.interpolateBlues(d.value / maxValue))
    .attr('opacity', 0.7)
    .on('click', (_, d) => {
      addMessage(`用户点击了"${d.name}"在地图上的位置。这可能表示您想分析该国家的数据。`, true)
      addMessage(`收到您的交互。您点击了"${d.name}"，这可能表明您想深入分析该国家的数据。`, false)
      currentIntent.value = '地理分析'
    })
}

// ========== 图表切换 ==========
const switchToBarChart = () => {
  currentChartType.value = 'bar'
  renderBarChart()
  addMessage('已切换到柱状图视图，适合比较不同类别的数据。', false)
}

const switchToLineChart = () => {
  currentChartType.value = 'line'
  renderLineChart()
  addMessage('已切换到折线图视图，适合观察数据随时间的变化趋势。', false)
}

const switchToMap = () => {
  currentChartType.value = 'map'
  renderWorldMap()
  addMessage('已切换到世界地图视图，适合查看地理分布数据。', false)
}

// ========== 报告生成 ==========
const generateReport = () => {
  let report = `=== 可视化交互分析报告 ===\n\n`
  report += `分析时间: ${new Date().toLocaleString()}\n`
  report += `最终意图: ${currentIntent.value}\n\n`

  report += `1. 交互历史:\n`
  chatHistory.value.forEach((item, i) => {
    report += `   - ${i + 1}. 用户: "${item.user}" | 意图: ${item.intent}\n`
  })

  report += `\n2. 图表分析:\n`
  switch (currentChartType.value) {
    case 'bar':
      report += `   - 查看了柱状图，比较了产品A-E的数值表现。\n`
      break
    case 'line':
      report += `   - 查看了折线图，观察了2023年1-6月的趋势变化。\n`
      break
    case 'map':
      report += `   - 查看了世界地图，比较了中国、美国、印度等国的人口数据。\n`
      break
  }

  report += `\n3. 深度分析建议:\n`
  if (currentIntent.value === '根因分析') {
    report += `   - 建议进一步分析导致销售额下降的具体因素，如产品类别、地区、渠道等。\n`
  } else if (currentIntent.value === '比较分析') {
    report += `   - 产品D表现最佳，建议分析其成功因素并推广至其他产品线。\n`
  } else if (currentIntent.value === '趋势分析') {
    report += `   - 整体呈上升趋势，但在某些月份有波动，建议关注市场活动与销售数据的关联。\n`
  } else if (currentIntent.value === '地理分析') {
    report += `   - 中国和印度人口最多，建议在这些地区加大市场投入。\n`
  } else {
    report += `   - 当前为探索性分析，建议根据业务目标进一步明确分析方向。\n`
  }

  report += `\n4. 结论:\n`
  report += `   - 基于本次交互，系统识别您的主要分析意图为"${currentIntent.value}"，并已通过可视化辅助您进行了初步探索。`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>分析报告</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
          pre { background: white; padding: 20px; border-radius: 8px; overflow-x: auto; }
          h1 { color: #4a90e2; }
        </style>
      </head>
      <body>
        <h1>📊 可视化交互分析报告</h1>
        <pre>${report}</pre>
      </body>
      </html>
    `)
    win.document.close()
  }
  addMessage('分析报告已在新窗口中打开！', false)
}

// ========== 窗口尺寸响应 ==========
const handleResize = () => {
  nextTick(() => {
    switch (currentChartType.value) {
      case 'bar':
        renderBarChart()
        break
      case 'line':
        renderLineChart()
        break
      case 'map':
        renderWorldMap()
        break
    }
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  initChat()
  renderBarChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// ========== 导出供模板使用 ==========
defineExpose({
  messages,
  userInput,
  statusText,
  chatMessages,
  chartContainer,
  sendMessage,
  handleKeyDown,
  switchToBarChart,
  switchToLineChart,
  switchToMap,
  generateReport
})
</script>

<style scoped>
/* 此处可放样式，或移至独立 CSS 文件 */
.chat-container {
  width: 350px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}
/* ...其余样式同前，略 */
</style>