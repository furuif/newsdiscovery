# NewsDiscovery Web UI

基于 React + Three.js 的可视化操作界面。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173/

### 构建生产版本

```bash
pnpm build
```

## ✨ 功能特性

### 1. 图片上传
- 支持图片 URL 输入
- 实时图片预览
- 可选描述输入

### 2. 实时进度监控
- WebSocket 实时连接
- 5 阶段进度显示
  - 📸 视觉分析
  - 🧱 积木设计
  - ✅ 结构验证
  - 🎨 3D 生成
  - 🖨️ 打印
- 动画进度条
- 当前状态提示

### 3. 结果展示
- 模型统计信息
  - 零件数量
  - 层数
  - 顶点/面数
- 尺寸信息
  - 宽×高×深
- 3D 预览（Three.js）
  - 轨道控制
  - 自动旋转
  - 缩放/平移
- 文件下载

### 4. 响应式设计
- 适配桌面和移动端
- 优雅的渐变 UI
- 流畅动画效果

## 🎨 技术栈

- **框架**: React 18
- **构建工具**: Vite 5
- **3D 渲染**: Three.js + React Three Fiber
- **3D 辅助**: React Three Drei
- **状态管理**: Zustand
- **实时通信**: Socket.IO Client
- **HTTP 客户端**: Axios

## 📁 项目结构

```
web/
├── src/
│   ├── components/
│   │   ├── App.tsx              # 主应用组件
│   │   ├── ImageUploader.tsx    # 图片上传组件
│   │   ├── ProgressPanel.tsx    # 进度面板
│   │   ├── ResultViewer.tsx     # 结果查看器
│   │   └── STLViewer.tsx        # 3D 预览组件
│   ├── store/
│   │   └── session-store.ts     # 状态管理
│   ├── App.css
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔌 API 集成

### 后端 API

- **创建会话**: `POST /api/session`
- **获取状态**: `GET /api/session/:id`
- **WebSocket**: `ws://localhost:3000`

### 代理配置

Vite 配置了自动代理到后端服务（端口 3000）：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
    '/socket.io': {
      target: 'ws://localhost:3000',
      ws: true,
    },
  },
}
```

## 🎯 使用流程

1. **输入图片 URL**
   - 粘贴图片链接
   - 或上传本地图片（待实现）

2. **添加描述（可选）**
   - 例如："一个可爱的小猫"

3. **点击"开始生成"**
   - 创建处理会话
   - 连接 WebSocket

4. **查看实时进度**
   - 5 个阶段动画展示
   - 百分比进度条
   - 当前操作提示

5. **查看结果**
   - 模型统计
   - 尺寸信息
   - 3D 预览
   - 下载 STL 文件

## 🚧 待实现功能

1. **本地图片上传**
   - 拖拽上传
   - 文件选择器
   - 图片压缩

2. **STL 文件加载**
   - 使用 `three-stdlib` 的 STLLoader
   - 真实模型渲染

3. **历史记录**
   - 本地存储
   - 会话列表
   - 结果回放

4. **分享功能**
   - 生成分享链接
   - 导出结果图片

5. **打印集成**
   - 拓竹打印机选择
   - 切片参数配置
   - 直接发送打印

## 🎨 UI 设计

### 配色方案

- **主色**: 渐变紫 (#667eea → #764ba2)
- **背景**: 渐变紫红
- **卡片**: 白色 + 阴影
- **文字**: 深灰/白色

### 动画效果

- **进度条**: 闪烁光泽效果
- **状态图标**: 脉冲动画
- **步骤激活**: 缩放 + 阴影
- **按钮悬停**: 上浮 + 阴影

## 📱 响应式断点

- **桌面**: > 768px
- **移动**: ≤ 768px

移动端优化：
- 按钮全宽
- 步骤缩小
- 3D 视图高度降低

## 🔧 开发命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 类型检查
pnpm typecheck
```

## 🐛 已知问题

1. **STL 加载器** - 需要添加 `three-stdlib` 依赖
2. **CORS** - 确保后端允许跨域
3. **WebSocket 重连** - 需要实现自动重连逻辑

## 📝 更新日志

### v1.0.0 (2026-03-12)

- ✅ 初始版本发布
- ✅ 基础 UI 框架
- ✅ 进度监控
- ✅ 结果展示
- ✅ WebSocket 集成
- 🚧 STL 预览（占位）

---

*NewsDiscovery Web UI v1.0 | Built with ❤️ and React*
