# NewsDiscovery 🤖🧱🖨️

> AI 驱动的图片到积木建模系统 - 基于 Agent 工作流，从图片到拓竹打印

## 项目简介

NewsDiscovery 是一个创新的 AI 系统，能够：
1. 📸 **分析图片** - 使用 Qwen-VL 等多模态大模型理解物体结构
2. 🧱 **积木化设计** - 将物体转换为布鲁可星辰版积木拼装方案
3. ✅ **结构验证** - 自动检查稳定性、可打印性
4. 🎨 **3D 模型生成** - 导出 STL/3MF 格式，应用公差补偿
5. 🖨️ **拓竹打印** - 自动推送到 Bambu Lab 打印机

## 技术栈

- **运行时**: Node.js 22+
- **语言**: TypeScript
- **框架**: Express + Socket.IO
- **AI**: Qwen-VL (百炼 API)
- **3D**: OpenSCAD / Blender
- **打印**: Bambu Lab API

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入 API keys
```

### 3. 启动开发服务器

```bash
pnpm dev
```

### 4. 访问服务

- HTTP API: http://localhost:3000
- WebSocket: ws://localhost:3000

## API 使用

### 创建处理会话

```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "description": "一个可爱的小猫",
    "targetSize": { "width": 100, "height": 80, "depth": 60 }
  }'
```

### WebSocket 连接

```javascript
const socket = io('ws://localhost:3000');

// 加入会话
socket.emit('join', sessionId);

// 监听进度
socket.on('progress', (data) => {
  console.log(`[${data.progress}%] ${data.message}`);
});

// 监听完成
socket.on('result', (data) => {
  console.log('处理完成!', data);
});
```

## Agent 架构

```
┌─────────────┐
│Orchestrator │ ← 总控 Agent
└──────┬──────┘
       │
       ├─► Vision Agent    (视觉分析)
       ├─► Design Agent    (积木设计)
       ├─► Validation Agent(结构验证)
       ├─► Generator Agent (3D 建模)
       └─► Bambu Agent     (打印集成)
```

## 项目结构

```
newsdiscovery/
├── src/
│   ├── agents/          # Agent 实现
│   │   ├── base.ts      # 基类和工作流引擎
│   │   ├── orchestrator.ts
│   │   ├── vision-agent.ts
│   │   └── design-agent.ts
│   ├── tools/           # 工具集
│   │   └── registry.ts
│   ├── types/           # TypeScript 类型
│   │   └── index.ts
│   ├── config/          # 配置
│   │   └── index.ts
│   └── index.ts         # 主入口
├── docs/                # 项目文档
├── .env.example         # 环境变量模板
├── package.json
└── tsconfig.json
```

## 开发进度

- ✅ 项目架构设计
- ✅ 类型定义
- ✅ 工具注册表
- ✅ Agent 基类
- ✅ Vision Agent
- ✅ Design Agent
- ✅ Orchestrator Agent
- 🚧 Validation Agent (待实现)
- 🚧 Generator Agent (待实现)
- 🚧 Bambu Agent (待实现)
- 🚧 零件库 (待实现)
- 🚧 OpenSCAD 集成 (待实现)

## 文档

详细设计文档见 `/docs` 目录：

- [AGENT_TOOL_DESIGN.md](./AGENT_TOOL_DESIGN.md) - 完整 Agent 工具设计
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - 项目计划
- [API_RESEARCH.md](./API_RESEARCH.md) - AI API 调研
- [BAMBU_ECOLOGY.md](./BAMBU_ECOLOGY.md) - 拓竹生态
- [BLOKS_GUIDE.md](./BLOKS_GUIDE.md) - 布鲁可指南

## 许可证

ISC

---

**🌟 让每张图片都能变成可拼装的积木！**
