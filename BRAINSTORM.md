# NewsDiscovery - AI 图片到 3D 积木建模项目

## 项目愿景
开发一个基于图片的 AI 3D 建模系统，将布鲁克（BrickLink Studio）的星辰版积木设计转换为可打印的 3D 模型，使用拓竹打印机输出。

## 核心技术栈
- **语言**: TypeScript (Node.js + 前端)
- **AI 模型**: 图片到 3D 生成
- **积木平台**: BrickLink Studio API
- **3D 打印**: Bambu Lab (拓竹) API

## 需要调研的关键问题

### 1. AI 图片到 3D 建模
- TripoSR / Tripo API
- CSM (Common Sense Machines)
- Luma AI
- Rodin (Deemos)
- 其他开源方案

### 2. BrickLink Studio 集成
- Studio API 是否存在？
- .io 文件格式解析
- 积木零件数据库
- 星辰版特殊零件

### 3. 拓竹打印机集成
- Bambu Lab Cloud API
- 本地局域网 API
- 3MF/G-code 发送
- 打印状态监控

### 4. 技术挑战
- 图片→3D 的精度问题
- 积木结构的可行性验证
- 零件连接强度
- 打印支撑优化

## 下一步
- [ ] 调研各 AI 3D 生成 API
- [ ] 研究 BrickLink 数据格式
- [ ] 测试拓竹 API 连接
- [ ] 设计系统架构
