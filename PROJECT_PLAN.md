# NewsDiscovery - AI 图片到积木建模项目

## 项目愿景
开发一个基于图片的 AI 积木建模系统，将图片转换为布鲁可星辰版积木的 3D 模型，并使用拓竹打印机打印。

## 核心技术路线

### 🚫 不采用：训练专用模型
- 数据收集成本高
- 训练周期长
- 泛化能力有限
- 维护成本大

### ✅ 采用：Agent + 现有大模型能力
- 利用 Qwen/GPT-4V 等模型的视觉理解能力
- 通过 Agent 工作流优化积木结构
- 迭代式设计，快速验证
- 低成本、高灵活性

## Agent 工作流设计

```
┌─────────────┐
│  用户上传图片  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 1: 视觉分析 Agent           │
│  - 识别物体类型、尺寸比例         │
│  - 分析结构特征（对称、分层等）    │
│  - 输出结构描述                   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 2: 积木化设计 Agent         │
│  - 将结构描述转换为积木零件组合    │
│  - 考虑连接强度和稳定性          │
│  - 输出零件清单和位置             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 3: 结构验证 Agent           │
│  - 检查悬空部分                  │
│  - 验证连接点强度                │
│  - 优化支撑结构                  │
│  - 迭代反馈给 Step 2             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 4: 3D 模型生成 Agent         │
│  - 生成 OpenSCAD 代码或 Blender 脚本 │
│  - 导出 STL/3MF 格式              │
│  - 准备打印                       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Step 5: 拓竹打印 Agent           │
│  - 推送到 Bambu Studio           │
│  - 切片参数优化                  │
│  - 发送打印任务                  │
└─────────────────────────────────┘
```

## 技术栈

### 后端
- **运行时**: Node.js 22+
- **语言**: TypeScript
- **大模型**: Qwen-VL / GPT-4V / Claude
- **3D 生成**: OpenSCAD (代码驱动) / Blender (Python API)

### 前端
- **框架**: React / Vue3
- **3D 预览**: Three.js / React Three Fiber
- **UI 组件**: Ant Design / Element Plus

### 积木数据
- **零件库**: 自建布鲁可零件数据库（JSON 格式）
- **尺寸规格**: 通过实物测量建立
- **连接规则**: 凸点间距、公差、配合规则

### 打印集成
- **切片**: Bambu Studio CLI
- **推送**: Bambu Cloud API / LAN API
- **监控**: 摄像头状态反馈

## 关键模块

### 1. 视觉分析模块
```typescript
interface VisualAnalysis {
  objectType: string;
  dimensions: { width: number; height: number; depth: number };
  features: string[];
  symmetry: 'none' | 'horizontal' | 'vertical' | 'radial';
  layers: number;
  complexity: 'simple' | 'medium' | 'complex';
}
```

### 2. 积木化引擎
```typescript
interface BrickModel {
  parts: BrickPart[];
  boundingBox: Dimensions;
  totalParts: number;
  estimatedCost: number;
  stability: number; // 0-1
}

interface BrickPart {
  partId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}
```

### 3. 结构验证器
- 悬空检测（>45° 需要支撑）
- 连接点数量检查
- 重心分析
- 分层打印可行性

### 4. 3D 模型生成器
- OpenSCAD 脚本生成
- 零件组装逻辑
- 公差补偿（±0.05mm）
- 导出 STL/3MF

## 开发阶段

### Phase 1: MVP（2-3 周）
- [ ] 搭建基础项目结构
- [ ] 集成 Qwen-VL API
- [ ] 手动定义 10-20 个基础零件
- [ ] 实现简单的积木化逻辑
- [ ] 输出 STL 文件
- [ ] 手动切片打印测试

### Phase 2: Agent 工作流（3-4 周）
- [ ] 实现 5 个 Agent 模块
- [ ] 完善零件库（50+ 零件）
- [ ] 添加结构验证
- [ ] 迭代优化逻辑
- [ ] Web 界面原型

### Phase 3: 拓竹集成（2 周）
- [ ] 集成 Bambu API
- [ ] 自动切片和推送
- [ ] 打印状态监控
- [ ] 完整流程测试

### Phase 4: 优化和扩展（持续）
- [ ] 零件库扩展（100+ 零件）
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 社区分享功能

## 风险和挑战

### 技术风险
- ⚠️ 大模型对积木结构的理解可能不准确
- ⚠️ 结构稳定性验证复杂
- ⚠️ 公差控制需要实际测试

### 缓解措施
- ✅ 多轮迭代验证
- ✅ 人工审核环节（初期）
- ✅ 社区反馈收集
- ✅ 实物测试快速迭代

## 成功指标

- [ ] 图片→积木模型成功率 > 70%
- [ ] 打印后可拼装成功率 > 80%
- [ ] 单次处理时间 < 5 分钟
- [ ] 支持 100+ 种基础零件
- [ ] 用户满意度 > 4/5

## 参考资源

- [API_RESEARCH.md](./API_RESEARCH.md) - AI 3D 生成 API 调研
- [BAMBU_ECOLOGY.md](./BAMBU_ECOLOGY.md) - 拓竹生态调研
- [BLOKS_GUIDE.md](./BLOKS_GUIDE.md) - 布鲁可积木指南
- [BRICKLINK_GUIDE.md](./BRICKLINK_GUIDE.md) - BrickLink 参考

## 下一步行动

1. [ ] 确认大模型选择（Qwen-VL vs 其他）
2. [ ] 购买/测量布鲁可星辰版零件
3. [ ] 搭建项目脚手架
4. [ ] 设计零件数据格式
5. [ ] 实现第一个 Agent 模块
