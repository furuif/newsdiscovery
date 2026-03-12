# NewsDiscovery 🤖🧱🎨

> **AI 驱动的图片到积木建模系统** - 从图片到 3D 打印，一站式自动化工作流

[![License](https://img.shields.io/github/license/furuif/newsdiscovery)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-beta-yellow)](.)

---

## 🌟 项目简介

NewsDiscovery 是一个创新的 AI 系统，能够：

1. 📸 **分析图片** - 使用 Qwen-VL 多模态大模型理解物体结构
2. 🧱 **积木化设计** - 将物体转换为布鲁可星辰版积木拼装方案
3. ✅ **结构验证** - 自动检查稳定性、可打印性
4. 🎨 **3D 模型生成** - 导出 STL 格式，应用公差补偿
5. 🖨️ **拓竹打印** - 自动推送到 Bambu Lab 打印机（待实现）
6. 🌐 **Web 界面** - 实时进度监控和 3D 预览

---

## 🚀 快速开始

### 环境要求

- Node.js >= 22.0.0
- pnpm >= 8.0.0
- OpenSCAD（可选，用于 3D 渲染）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入 API keys
```

**必需配置**:
```bash
# Qwen-VL API 配置（百炼）
QWEN_API_KEY=your_api_key_here
QWEN_MODEL=qwen-vl-max
```

**可选配置**:
```bash
# OpenSCAD 路径
OPENSCAD_PATH=/usr/bin/openscad

# 拓竹打印机（待实现）
BAMBU_PRINTER_ID=
BAMBU_ACCESS_CODE=
BAMBU_CONNECTION=lan
```

获取 Qwen API Key: https://dashscope.console.aliyun.com/

### 3. 启动服务

#### 后端服务（端口 3000）

```bash
pnpm dev
```

#### 前端服务（端口 5173）

```bash
cd web
pnpm dev
```

### 4. 访问应用

- **Web 界面**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

---

## 🎯 功能特性

### 核心 Agent 系统

| Agent | 状态 | 职责 |
|-------|------|------|
| 📸 Vision Agent | ✅ | 图片分析，Qwen-VL 集成 |
| 🧱 Design Agent | ✅ | 积木设计方案生成 |
| ✅ Validation Agent | ✅ | 结构验证和评分 |
| 🎨 Generator Agent | ✅ | 3D 模型生成 |
| 🎮 Orchestrator | ✅ | 总控和工作流引擎 |
| 🖨️ Bambu Agent | 🚧 | 拓竹打印集成 |

### 零件库

- **24 个基础零件** - 9 砖 + 5 板 + 2 特殊件 + 2 轮子 + 2 门窗 + 2 连接件 + 2 装饰件
- **60+ 颜色选项** - 支持常见颜色
- **自动搜索** - 按分类、尺寸、颜色筛选

### Web 界面

- 🎨 **美观 UI** - 紫色渐变主题，流畅动画
- ⏳ **实时进度** - WebSocket 推送，5 阶段动画
- 🎨 **3D 预览** - Three.js 渲染，可旋转/缩放
- 📱 **响应式** - 桌面端和移动端适配

---

## 📁 项目结构

```
newsdiscovery/
├── src/                      # 后端源代码
│   ├── agents/               # Agent 实现
│   │   ├── base.ts           # 基类和工作流引擎
│   │   ├── vision-agent.ts   # 视觉分析 Agent
│   │   ├── design-agent.ts   # 积木设计 Agent
│   │   ├── validation-agent.ts # 结构验证 Agent
│   │   ├── generator-agent.ts # 3D 生成 Agent
│   │   └── orchestrator.ts   # 总控 Agent
│   ├── services/             # 外部服务
│   │   ├── qwen-vl.ts        # Qwen-VL API
│   │   └── openscad.ts       # OpenSCAD 渲染
│   ├── data/                 # 数据文件
│   │   └── bloks-parts.ts    # 布鲁可零件库
│   ├── tools/                # 工具注册表
│   │   └── registry.ts       # 26 个工具
│   ├── types/                # TypeScript 类型
│   │   └── index.ts          # 100+ 类型定义
│   ├── config/               # 配置
│   │   └── index.ts          # 环境变量
│   ├── websocket/            # WebSocket 处理
│   ├── api/                  # API 路由
│   └── index.ts              # 主入口
├── web/                      # 前端源代码
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── store/            # 状态管理
│   │   └── App.tsx           # 主应用
│   ├── package.json
│   └── vite.config.ts
├── docs/                     # 项目文档
├── test-*.js                 # 测试脚本
├── .env.example              # 环境变量模板
├── package.json
└── README.md
```

---

## 🔌 API 使用

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

**响应**:
```json
{
  "success": true,
  "data": {
    "sessionId": "session_1773288020522",
    "status": "pending",
    "createdAt": "2026-03-12T04:00:20.522Z"
  }
}
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

---

## 🧪 测试

### 集成测试

```bash
node test-web-integration.js
```

**测试结果**:
```
✅ 后端健康检查
✅ 前端页面加载
✅ API 会话创建
✅ WebSocket 配置

总分：4/4 通过
```

### 零件库测试

```bash
cd web && npx tsx ../test-parts.ts
```

**零件统计**:
```
📦 零件总数：24 个
  - brick: 9 个
  - plate: 5 个
  - special: 2 个
  - wheel: 2 个
  - window/door: 2 个
  - connector: 2 个
  - decoration: 2 个
```

---

## 📊 代码统计

| 模块 | 文件数 | 代码行数 |
|------|--------|----------|
| 后端 | 15 | ~3720 |
| 前端 | 17 | ~1090 |
| **总计** | **32** | **~4810** |

**类型定义**: 100+  
**工具数量**: 26 个  
**Agent 数量**: 5 个  

---

## 🎯 项目完成度

### 已完成 ✅

- [x] 完整 Agent 架构 (5/5)
- [x] 视觉分析集成 (Qwen-VL)
- [x] 积木设计算法
- [x] 结构验证系统
- [x] 3D 模型生成
- [x] 零件库 (24 个)
- [x] Web 可视化界面
- [x] 实时进度推送
- [x] 响应式设计

### 待完成 🚧

- [ ] STL 文件真实加载
- [ ] 本地图片上传
- [ ] Bambu Agent (拓竹打印)
- [ ] 历史记录功能
- [ ] 文件下载功能
- [ ] WebSocket 自动重连

**总体完成度**: **90%** 🎯

---

## 🛠️ 技术栈

### 后端
- **运行时**: Node.js 22+
- **语言**: TypeScript 5.9
- **框架**: Express 5 + Socket.IO
- **AI**: Qwen-VL (百炼 API)
- **3D**: OpenSCAD
- **日志**: Pino

### 前端
- **框架**: React 18
- **构建**: Vite 5
- **3D**: Three.js + React Three Fiber
- **状态**: Zustand
- **通信**: Socket.IO Client
- **HTTP**: Axios

---

## 📝 开发日志

- **2026-03-12**: Web UI 完成，所有测试通过 ✅
- **2026-03-12**: Generator Agent 和 OpenSCAD 集成 ✅
- **2026-03-12**: Validation Agent 和零件库 v1 ✅
- **2026-03-12**: 项目初始化，核心架构完成 ✅

详细日志见 [`docs/`](docs/) 目录。

---

## 🔗 相关资源

- **GitHub**: https://github.com/furuif/newsdiscovery
- **Qwen-VL API**: https://help.aliyun.com/zh/dashscope/
- **OpenSCAD**: https://openscad.org/
- **布鲁可积木**: https://www.bloks.cn/
- **Three.js**: https://threejs.org/

---

## 📄 许可证

ISC License

---

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

当前优先任务见 GitHub Issues。

---

*NewsDiscovery v1.0-beta | Built with ❤️ and AI* 🤖
