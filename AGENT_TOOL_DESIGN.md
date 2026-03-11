# NewsDiscovery - 完整 Agent 工具设计

> 从图片到拓竹打印的完整工作流  
> 版本：1.0 | 日期：2026-03-11

---

## 目录

1. [系统架构总览](#1-系统架构总览)
2. [核心 Agent 设计](#2-核心-agent-设计)
3. [工具集详细设计](#3-工具集详细设计)
4. [数据格式规范](#4-数据格式规范)
5. [工作流引擎](#5-工作流引擎)
6. [错误处理与恢复](#6-错误处理与恢复)
7. [用户交互设计](#7-用户交互设计)
8. [部署架构](#8-部署架构)

---

## 1. 系统架构总览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        NewsDiscovery System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │  User Input  │ 图片 / 文字描述                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Gateway                              │ │
│  │  - 请求验证  - 速率限制  - 会话管理                         │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         │             │             │                            │
│         ▼             ▼             ▼                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Orchestr │  │  Session │  │  Context │                      │
│  │   ator   │  │  Manager │  │   Store  │                      │
│  │  Agent   │  │          │  │          │                      │
│  └────┬─────┘  └──────────┘  └──────────┘                      │
│       │                                                         │
│       │  ┌──────────────────────────────────────────┐          │
│       │  │         Agent Workflow Pipeline          │          │
│       │  │                                          │          │
│       │  │  ┌────────────────────────────────────┐ │          │
│       │  │  │  1. Vision Analysis Agent          │ │          │
│       │  │  │     Tools: [analyze_image,         │ │          │
│       │  │  │             estimate_dimensions]   │ │          │
│       │  │  └────────────────────────────────────┘ │          │
│       │  │                    │                     │          │
│       │  │                    ▼                     │          │
│       │  │  ┌────────────────────────────────────┐ │          │
│       │  │  │  2. Brick Design Agent             │ │          │
│       │  │  │     Tools: [select_parts,          │ │          │
│       │  │  │             place_bricks,          │ │          │
│       │  │  │             optimize_structure]    │ │          │
│       │  │  └────────────────────────────────────┘ │          │
│       │  │                    │                     │          │
│       │  │                    ▼                     │          │
│       │  │  ┌────────────────────────────────────┐ │          │
│       │  │  │  3. Validation Agent               │ │          │
│       │  │  │     Tools: [check_stability,       │ │          │
│       │  │  │             check_connections,     │ │          │
│       │  │  │             simulate_assembly]     │ │          │
│       │  │  └────────────────────────────────────┘ │          │
│       │  │                    │                     │          │
│       │  │                    ▼                     │          │
│       │  │  ┌────────────────────────────────────┐ │          │
│       │  │  │  4. Model Generator Agent          │ │          │
│       │  │  │     Tools: [generate_openscad,     │ │          │
│       │  │  │             export_stl,            │ │          │
│       │  │  │             export_3mf]            │ │          │
│       │  │  └────────────────────────────────────┘ │          │
│       │  │                    │                     │          │
│       │  │                    ▼                     │          │
│       │  │  ┌────────────────────────────────────┐ │          │
│       │  │  │  5. Bambu Print Agent              │ │          │
│       │  │  │     Tools: [slice_model,           │ │          │
│       │  │  │             send_to_printer,       │ │          │
│       │  │  │             monitor_print]         │ │          │
│       │  │  └────────────────────────────────────┘ │          │
│       │  │                                          │          │
│       │  └──────────────────────────────────────────┘          │
│       │                                                         │
│       ▼                                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Tool Execution Layer                     │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │  LLM Tools  │  │  3D Tools   │  │ Print Tools │        │ │
│  │  │ - Qwen-VL   │  │ - OpenSCAD  │  │ - Bambu API │        │ │
│  │  │ - GPT-4V    │  │ - Blender   │  │ - LAN/MQTT  │        │ │
│  │  │ - Claude    │  │ - MeshLab   │  │ - Cloud     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 设计原则

借鉴 **OpenCode** 和 **Claude Code** 的架构思想：

| 原则 | 说明 | 实现方式 |
|------|------|----------|
| **Plan-First** | 先规划后执行 | 每个 Agent 输出执行计划，用户可确认 |
| **专业化分工** | 每个 Agent 专注单一职责 | 5 个独立 Agent，各自有专用工具集 |
| **可解释性** | 决策过程透明 | 每步输出思考过程和依据 |
| **迭代优化** | 支持反馈循环 | Validation 失败时回溯到 Design |
| **工具标准化** | 统一工具接口 | JSON Schema 定义所有工具 |
| **上下文管理** | 高效利用 token | 分层存储：短期/长期/压缩 |

---

## 2. 核心 Agent 设计

### 2.1 Orchestrator Agent（总控）

**职责**：接收用户请求，协调各 Agent 工作流，管理会话状态

**System Prompt**：
```
你是 NewsDiscovery 系统的总控 Agent。你的职责是：
1. 理解用户需求（图片 + 文字描述）
2. 规划整体工作流程
3. 按顺序调用各专业 Agent
4. 汇总结果并呈现给用户
5. 处理异常和用户反馈

工作流程：
- 接收输入 → 分析任务 → 调用 Vision Agent → 等待结果
- 调用 Design Agent → 等待结果 → 调用 Validation Agent
- 如验证失败，返回 Design Agent 迭代（最多 3 次）
- 验证通过后，调用 Generator Agent → Bambu Agent
- 汇总所有结果，输出最终报告

注意事项：
- 每步都要向用户报告进度
- 关键决策点需要用户确认（如零件数量>100）
- 遇到错误时，先尝试自愈，失败则请求人工介入
```

**工具集**：
```typescript
interface OrchestratorTools {
  // 会话管理
  createSession(params: { userId: string; input: any }): Promise<Session>;
  getSession(sessionId: string): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<void>;
  
  // Agent 调用
  callAgent(agentId: string, input: any, options?: CallOptions): Promise<any>;
  
  // 用户交互
  sendProgress(message: string, progress: number): Promise<void>;
  requestConfirmation(question: string, options: string[]): Promise<string>;
  sendResult(result: any): Promise<void>;
}
```

---

### 2.2 Vision Analysis Agent（视觉分析）

**职责**：分析输入图片，识别物体特征，估算尺寸和结构

**System Prompt**：
```
你是视觉分析专家。你的职责是分析用户提供的图片，输出详细的结构描述。

分析维度：
1. 物体识别：这是什么物体？（动物、建筑、车辆、人物等）
2. 尺寸估算：基于常见参照物估算实际尺寸
3. 结构特征：
   - 对称性（无/水平/垂直/径向）
   - 分层结构（几层，每层特征）
   - 突出部分（耳朵、翅膀、轮子等）
   - 空洞/镂空部分
4. 复杂度评估：简单/中等/复杂
5. 颜色分析：主要颜色分布

输出格式：严格的 VisualAnalysis JSON 结构

注意事项：
- 如果图片模糊或多物体，要求用户澄清
- 尺寸估算是近似值，允许±20% 误差
- 标注不确定的部分
```

**工具集**：
```typescript
interface VisionTools {
  // 图像分析
  analyzeImage(imageUrl: string, options?: AnalysisOptions): Promise<ImageAnalysis>;
  
  // 尺寸估算
  estimateDimensions(
    image: ImageAnalysis, 
    reference?: string // 参照物，如"成人身高"、"硬币"
  ): Promise<Dimensions>;
  
  // 特征提取
  extractFeatures(image: ImageAnalysis): Promise<Feature[]>;
  
  // 颜色分析
  analyzeColors(image: ImageAnalysis): Promise<ColorDistribution>;
}
```

**输入/输出**：
```typescript
// 输入
interface VisionInput {
  imageUrl: string;
  userDescription?: string; // 用户补充描述
  targetSize?: { // 期望的目标尺寸（毫米）
    width?: number;
    height?: number;
    depth?: number;
  };
}

// 输出
interface VisualAnalysis {
  objectType: string;
  category: 'animal' | 'building' | 'vehicle' | 'character' | 'other';
  confidence: number; // 0-1
  
  dimensions: {
    estimated: { width: number; height: number; depth: number }; // mm
    scale: number; // 相对于原物的缩放比例
  };
  
  structure: {
    symmetry: 'none' | 'horizontal' | 'vertical' | 'radial';
    layers: number;
    hasOverhangs: boolean;
    hasHollowParts: boolean;
    complexity: 'simple' | 'medium' | 'complex';
  };
  
  features: Array<{
    name: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    size: 'small' | 'medium' | 'large';
  }>;
  
  colors: Array<{
    name: string;
    hexCode: string;
    coverage: number; // 0-1
  }>;
  
  notes: string[]; // 不确定或需要用户确认的点
}
```

---

### 2.3 Brick Design Agent（积木设计）

**职责**：将视觉分析结果转换为积木零件组合，设计拼装方案

**System Prompt**：
```
你是积木设计专家，精通布鲁可星辰版积木系统。你的职责是：
将视觉分析结果转换为可行的积木拼装方案。

设计原则：
1. 结构优先：确保连接稳固，能承受自身重量
2. 零件优化：在满足结构的前提下，尽量减少零件数量
3. 颜色匹配：尽可能匹配原图颜色分布
4. 打印友好：考虑 3D 打印的可行性（避免过大悬空）

设计流程：
1. 分析 VisualAnalysis，确定整体尺寸和关键特征
2. 从零件库选择合适的零件类型
3. 逐层搭建，从底部基础开始
4. 添加特征部分（耳朵、翅膀等）
5. 检查连接点，确保稳固
6. 输出完整的零件清单和位置信息

注意事项：
- 单个零件最大尺寸不超过 100mm（打印限制）
- 悬空角度>45° 需要添加支撑或修改设计
- 连接点至少要有 2 个凸点接触
- 标注需要特殊处理的零件
```

**工具集**：
```typescript
interface BrickDesignTools {
  // 零件库查询
  searchParts(query: PartQuery): Promise<Part[]>;
  getPartById(partId: string): Promise<Part>;
  getCompatibleParts(partId: string): Promise<Part[]>;
  
  // 零件放置
  placeBrick(
    partId: string,
    position: [number, number, number],
    rotation: [number, number, number],
    color: string
  ): Promise<PlacedPart>;
  
  // 结构优化
  optimizeStructure(model: BrickModel): Promise<OptimizationResult>;
  reinforceWeakPoints(model: BrickModel): Promise<Reinforcement[]>;
  
  // 连接检查
  checkConnections(model: BrickModel): Promise<ConnectionAnalysis>;
  
  // 成本估算
  estimateCost(parts: PartList): Promise<CostEstimate>;
}
```

**输入/输出**：
```typescript
// 输入
interface DesignInput {
  analysis: VisualAnalysis;
  constraints?: {
    maxParts?: number;
    maxCost?: number;
    preferredColors?: string[];
    excludeParts?: string[];
  };
}

// 输出
interface BrickModel {
  metadata: {
    id: string;
    createdAt: string;
    version: number;
    basedOn: string; // VisualAnalysis ID
  };
  
  parts: PlacedPart[];
  
  statistics: {
    totalParts: number;
    uniqueParts: number;
    totalVolume: number; // mm³
    estimatedWeight: number; // g
    estimatedCost: number; // CNY
    buildTime: number; // 估算拼装时间（分钟）
  };
  
  layers: Layer[]; // 分层信息（用于打印）
  
  stability: {
    score: number; // 0-1
    weakPoints: WeakPoint[];
    recommendations: string[];
  };
  
  boundingBox: {
    width: number;
    height: number;
    depth: number;
  };
}

interface PlacedPart {
  id: string; // 唯一标识
  partId: string; // 零件型号
  position: [number, number, number]; // mm，相对于原点
  rotation: [number, number, number]; // 欧拉角，度
  color: string; // 颜色代码
  connections: string[]; // 连接的零件 ID 列表
}

interface Layer {
  index: number;
  height: number; // mm
  parts: string[]; // 该层的零件 ID 列表
}
```

---

### 2.4 Validation Agent（结构验证）

**职责**：验证积木模型的结构稳定性、可打印性、可拼装性

**System Prompt**：
```
你是结构验证专家。你的职责是严格审查积木设计方案，确保：
1. 结构稳定，不会自行散架
2. 可以 3D 打印（公差、支撑）
3. 打印后可以实际拼装

验证流程：
1. 物理稳定性检查
   - 重心位置（是否在支撑面内）
   - 连接点数量（每个零件至少 2 个连接）
   - 悬空部分（>45° 需要支撑）
   
2. 打印可行性检查
   - 零件尺寸（不超过打印机行程）
   - 公差配合（±0.05mm）
   - 支撑需求评估
   
3. 拼装可行性检查
   - 零件是否可访问（能否用手拼装）
   - 拼装顺序建议
   - 特殊工具需求

验证规则：
- 通过：所有检查项合格
- 有条件通过：有小问题但不影响整体
- 失败：存在严重问题，需要重新设计

输出详细的验证报告，包含问题和修改建议。
```

**工具集**：
```typescript
interface ValidationTools {
  // 稳定性分析
  analyzeStability(model: BrickModel): Promise<StabilityReport>;
  calculateCenterOfMass(model: BrickModel): Promise<Vector3>;
  checkSupportBase(model: BrickModel): Promise<SupportAnalysis>;
  
  // 连接检查
  checkConnectionStrength(model: BrickModel): Promise<ConnectionReport>;
  findWeakConnections(model: BrickModel): Promise<WeakConnection[]>;
  
  // 打印可行性
  checkPrintability(model: BrickModel): Promise<PrintabilityReport>;
  analyzeOverhangs(model: BrickModel): Promise<OverhangAnalysis>;
  estimateSupportMaterial(model: BrickModel): Promise<SupportEstimate>;
  
  // 公差分析
  checkTolerances(model: BrickModel): Promise<ToleranceReport>;
  
  // 拼装模拟
  simulateAssembly(model: BrickModel): Promise<AssemblySimulation>;
  generateAssemblySteps(model: BrickModel): Promise<AssemblyStep[]>;
}
```

**输入/输出**：
```typescript
// 输入
interface ValidationInput {
  model: BrickModel;
  printerModel?: string; // 拓竹打印机型号
  material?: string; // 打印材料（PLA/PETG 等）
}

// 输出
interface ValidationReport {
  overall: 'pass' | 'conditional_pass' | 'fail';
  score: number; // 0-100
  
  checks: Array<{
    name: string;
    status: 'pass' | 'warning' | 'fail';
    details: string;
    suggestion?: string;
  }>;
  
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location?: {
      partId: string;
      position: [number, number, number];
    };
    suggestion: string;
  }>;
  
  recommendations: string[];
  
  printSettings?: {
    layerHeight: number; // mm
    infill: number; // %
    support: boolean;
    supportDensity: number; // %
    printSpeed: number; // mm/s
  };
}
```

---

### 2.5 Model Generator Agent（3D 模型生成）

**职责**：将积木模型转换为可打印的 3D 文件格式

**System Prompt**：
```
你是 3D 建模专家。你的职责是将积木模型转换为高质量的 3D 打印文件。

工作流程：
1. 接收 BrickModel（零件列表和位置）
2. 为每个零件生成 3D 几何体
3. 应用公差补偿（+0.05mm 用于凸点，-0.05mm 用于孔洞）
4. 合并所有零件为完整模型
5. 检查并修复网格问题（非流形边、孔洞等）
6. 导出为 STL 和 3MF 格式

公差规则：
- 凸点（stud）：直径 +0.05mm（确保紧密配合）
- 孔洞（tube）：直径 -0.05mm
- 平面接触：无补偿
- 打印方向：优化以减少支撑

质量要求：
- 网格流形（watertight）
- 法线方向一致
- 无自相交
- 最小壁厚 ≥ 1.2mm（PLA 打印）
```

**工具集**：
```typescript
interface GeneratorTools {
  // OpenSCAD 生成
  generateOpenSCAD(model: BrickModel): Promise<string>; // SCAD 代码
  compileOpenSCAD(scadCode: string): Promise<Buffer>; // 编译为 STL
  
  // Blender 操作
  generateBlenderScript(model: BrickModel): Promise<string>;
  runBlenderScript(script: string): Promise<Buffer>;
  
  // 网格处理
  repairMesh(mesh: Mesh): Promise<Mesh>;
  simplifyMesh(mesh: Mesh, targetFaces: number): Promise<Mesh>;
  checkManifold(mesh: Mesh): Promise<MeshAnalysis>;
  
  // 文件导出
  exportSTL(mesh: Mesh, options?: STLOptions): Promise<Buffer>;
  export3MF(mesh: Mesh, options?: 3MFOptions): Promise<Buffer>;
  exportOBJ(mesh: Mesh): Promise<Buffer>;
  
  // 公差补偿
  applyTolerance(mesh: Mesh, tolerance: number): Promise<Mesh>;
}
```

**输入/输出**：
```typescript
// 输入
interface GeneratorInput {
  model: BrickModel;
  options?: {
    format: 'stl' | '3mf' | 'obj';
    tolerance: number; // mm，默认 0.05
    mergeParts: boolean; // 是否合并为单一网格
    addPartNumbers: boolean; // 是否在模型上刻零件编号
  };
}

// 输出
interface GeneratedModel {
  id: string;
  createdAt: string;
  
  files: Array<{
    format: 'stl' | '3mf' | 'obj';
    path: string;
    size: number; // bytes
    checksum: string;
  }>;
  
  statistics: {
    vertices: number;
    faces: number;
    volume: number; // mm³
    surfaceArea: number; // mm²
    boundingBox: {
      width: number;
      height: number;
      depth: number;
    };
  };
  
  printReadiness: {
    isManifold: boolean;
    hasHoles: boolean;
    hasSelfIntersections: boolean;
    minWallThickness: number; // mm
    ready: boolean;
  };
  
  metadata: {
    generator: string;
    generatorVersion: string;
    processingTime: number; // ms
  };
}
```

---

### 2.6 Bambu Print Agent（拓竹打印）

**职责**：将 3D 模型推送到拓竹打印机，监控打印过程

**System Prompt**：
```
你是拓竹打印专家。你的职责是将 3D 模型成功打印出来。

工作流程：
1. 接收 3D 模型文件（STL/3MF）
2. 连接拓竹打印机（云端或局域网）
3. 配置切片参数（基于 Validation 建议）
4. 切片并预览
5. 发送打印任务
6. 监控打印进度
7. 处理异常（堵头、翘边等）

连接方式优先级：
1. 局域网直连（最快，无需云端）
2. Bambu Cloud（需要账号认证）
3. 本地切片 + SD 卡（备用方案）

监控要点：
- 第一层粘附情况
- 耗材余量
- 打印温度
- 预计完成时间

异常处理：
- 检测到失败 → 暂停打印 → 通知用户
- 耗材耗尽 → 等待更换 → 继续打印
```

**工具集**：
```typescript
interface BambuTools {
  // 打印机连接
  listPrinters(): Promise<Printer[]>;
  connectPrinter(printerId: string, options?: ConnectOptions): Promise<void>;
  getPrinterStatus(printerId: string): Promise<PrinterStatus>;
  
  // 切片
  sliceModel(
    modelPath: string,
    settings: SliceSettings
  ): Promise<SliceResult>;
  
  // 打印任务
  sendPrintJob(job: PrintJob): Promise<JobId>;
  cancelPrintJob(jobId: string): Promise<void>;
  pausePrintJob(jobId: string): Promise<void>;
  resumePrintJob(jobId: string): Promise<void>;
  
  // 监控
  getPrintProgress(jobId: string): Promise<PrintProgress>;
  getPrinterCamera(printerId: string): Promise<ImageStream>;
  getPrintTimeRemaining(jobId: string): Promise<number>; // 秒
  
  // 耗材
  getFilamentInfo(printerId: string): Promise<FilamentInfo>;
  setFilament(printerId: string, filament: Filament): Promise<void>;
}
```

**输入/输出**：
```typescript
// 输入
interface PrintInput {
  modelPath: string;
  printerId?: string; // 留空则使用默认打印机
  settings?: SliceSettings;
  options?: {
    autoStart: boolean; // 切片后自动开始打印
    notifyOnComplete: boolean;
    timelapse: boolean; // 是否生成延时摄影
  };
}

interface SliceSettings {
  layerHeight: number; // mm
  wallLoops: number;
  topSurfaceLayers: number;
  bottomSurfaceLayers: number;
  infillDensity: number; // %
  infillPattern: 'grid' | 'lines' | 'triangles' | 'gyroid';
  supportEnabled: boolean;
  supportType: 'normal' | 'tree';
  supportDensity: number; // %
  printSpeed: number; // mm/s
  material: 'PLA' | 'PETG' | 'ABS' | 'TPU';
  nozzleTemperature: number; // °C
  bedTemperature: number; // °C
}

// 输出
interface PrintResult {
  jobId: string;
  status: 'queued' | 'slicing' | 'printing' | 'completed' | 'failed' | 'cancelled';
  
  printer: {
    id: string;
    name: string;
    model: string; // X1C / P1P / A1 等
  };
  
  timeline: {
    queuedAt?: string;
    slicingStartedAt?: string;
    slicingCompletedAt?: string;
    printingStartedAt?: string;
    completedAt?: string;
  };
  
  progress: {
    percentage: number; // 0-100
    currentLayer: number;
    totalLayers: number;
    timeElapsed: number; // 秒
    timeRemaining: number; // 秒
  };
  
  output: {
    gcodePath?: string;
    gcodeSize?: number; // bytes
    timelapsePath?: string;
    printedParts?: string[]; // 如果分件打印
  };
  
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}
```

---

## 3. 工具集详细设计

### 3.1 工具注册系统

```typescript
// 工具定义
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  returns: JSONSchema;
  handler: (params: any) => Promise<any>;
  requiresApproval?: boolean;
  timeout?: number; // ms
}

// 工具注册表
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  
  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }
  
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }
  
  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  // 为 LLM 生成工具描述（用于 function calling）
  toLLMFormat(): any[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
}
```

### 3.2 工具执行引擎

```typescript
class ToolExecutor {
  constructor(
    private registry: ToolRegistry,
    private logger: Logger
  ) {}
  
  async execute(
    toolName: string,
    params: any,
    context: ExecutionContext
  ): Promise<any> {
    const tool = this.registry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    
    // 检查是否需要用户批准
    if (tool.requiresApproval) {
      const approved = await context.requestApproval({
        tool: toolName,
        params,
        description: tool.description,
      });
      if (!approved) {
        throw new Error('Tool execution not approved by user');
      }
    }
    
    // 执行工具
    this.logger.info(`Executing tool: ${toolName}`, { params });
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        tool.handler(params),
        timeout(tool.timeout || 30000),
      ]);
      
      const duration = Date.now() - startTime;
      this.logger.info(`Tool completed: ${toolName}`, { duration });
      
      return result;
    } catch (error) {
      this.logger.error(`Tool failed: ${toolName}`, { error });
      throw error;
    }
  }
}
```

---

## 4. 数据格式规范

### 4.1 零件库格式 (parts.json)

```json
{
  "version": "1.0",
  "updatedAt": "2026-03-11",
  "parts": [
    {
      "id": "bloks_std_brick_2x4",
      "name": "标准砖块 2x4",
      "category": "brick",
      "dimensions": {
        "width": 15.8,
        "height": 9.6,
        "depth": 7.9,
        "unit": "mm"
      },
      "studs": {
        "top": { "rows": 1, "cols": 4, "diameter": 4.8 },
        "bottom": null
      },
      "tubes": {
        "count": 3,
        "diameter": 6.2,
        "positions": [[0, 0, 0], [0, 0, 7.9], [0, 0, 15.8]]
      },
      "weight": 2.5,
      "material": "ABS",
      "colors": ["red", "blue", "yellow", "green", "white", "black"],
      "printSettings": {
        "layerHeight": 0.2,
        "infill": 20,
        "support": false
      },
      "modelFile": "parts/std_brick_2x4.stl"
    }
  ]
}
```

### 4.2 会话状态格式

```typescript
interface SessionState {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  
  status: 'pending' | 'analyzing' | 'designing' | 'validating' | 
          'generating' | 'printing' | 'completed' | 'failed';
  
  input: {
    imageUrl: string;
    description?: string;
    targetSize?: Dimensions;
  };
  
  workflow: {
    currentAgent: string;
    completedAgents: string[];
    iterationCount: number;
    lastError?: string;
  };
  
  artifacts: {
    visionAnalysis?: VisualAnalysis;
    brickModel?: BrickModel;
    validationReport?: ValidationReport;
    generatedModel?: GeneratedModel;
    printResult?: PrintResult;
  };
  
  metadata: {
    totalProcessingTime: number; // ms
    llmCalls: number;
    toolCalls: number;
    tokenUsage: {
      input: number;
      output: number;
    };
  };
}
```

---

## 5. 工作流引擎

### 5.1 状态机设计

```typescript
enum WorkflowState {
  INIT = 'init',
  VISION_ANALYSIS = 'vision_analysis',
  BRICK_DESIGN = 'brick_design',
  VALIDATION = 'validation',
  MODEL_GENERATION = 'model_generation',
  PRINT_PREPARATION = 'print_preparation',
  PRINTING = 'printing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  condition: (context: WorkflowContext) => boolean;
  action?: (context: WorkflowContext) => Promise<void>;
}

class WorkflowEngine {
  private state: WorkflowState = WorkflowState.INIT;
  private transitions: WorkflowTransition[] = [];
  
  async run(context: WorkflowContext): Promise<void> {
    while (this.state !== WorkflowState.COMPLETED && 
           this.state !== WorkflowState.FAILED) {
      const transition = this.transitions.find(t => 
        t.from === this.state && t.condition(context)
      );
      
      if (!transition) {
        throw new Error(`No valid transition from state: ${this.state}`);
      }
      
      if (transition.action) {
        await transition.action(context);
      }
      
      this.state = transition.to;
      context.emit('stateChange', this.state);
    }
  }
}
```

### 5.2 迭代循环

```typescript
async function designValidationLoop(
  context: WorkflowContext,
  maxIterations: number = 3
): Promise<BrickModel> {
  let model: BrickModel;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    iteration++;
    context.log(`Design iteration ${iteration}/${maxIterations}`);
    
    // 设计
    model = await context.callAgent('brick_design', {
      analysis: context.visionAnalysis,
      previousModel: model,
      feedback: context.lastValidationIssues,
    });
    
    // 验证
    const validation = await context.callAgent('validation', { model });
    
    if (validation.overall === 'pass') {
      context.log('Validation passed!');
      return model;
    } else if (validation.overall === 'conditional_pass') {
      context.log('Validation passed with minor issues');
      context.warnings = validation.issues;
      return model;
    } else {
      context.log('Validation failed, retrying design');
      context.lastValidationIssues = validation.issues;
    }
  }
  
  throw new Error(`Design failed after ${maxIterations} iterations`);
}
```

---

## 6. 错误处理与恢复

### 6.1 错误分类

```typescript
enum ErrorType {
  // 可恢复错误
  TRANSIENT = 'transient', // 临时错误，可重试
  VALIDATION = 'validation', // 验证失败，需修改设计
  RESOURCE = 'resource', // 资源不足，需等待
  
  // 不可恢复错误
  FATAL = 'fatal', // 致命错误，终止流程
  USER_CANCEL = 'user_cancel', // 用户取消
  TIMEOUT = 'timeout', // 超时
}

interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
}
```

### 6.2 重试机制

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options || {};
  
  let lastError: Error;
  let currentDelay = delay;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt <= maxRetries) {
        onRetry?.(error, attempt);
        await sleep(currentDelay);
        currentDelay *= backoff;
      }
    }
  }
  
  throw lastError;
}
```

### 6.3 检查点与回滚

```typescript
class CheckpointManager {
  private checkpoints: Map<string, any> = new Map();
  
  async save<T>(sessionId: string, state: T): Promise<void> {
    const key = `${sessionId}:${Date.now()}`;
    await this.storage.write(key, JSON.stringify(state));
    this.checkpoints.set(sessionId, key);
  }
  
  async restore<T>(sessionId: string): Promise<T | null> {
    const key = this.checkpoints.get(sessionId);
    if (!key) return null;
    
    const data = await this.storage.read(key);
    return JSON.parse(data) as T;
  }
  
  async rollback(sessionId: string): Promise<boolean> {
    const state = await this.restore(sessionId);
    if (state) {
      await this.stateManager.restore(sessionId, state);
      return true;
    }
    return false;
  }
}
```

---

## 7. 用户交互设计

### 7.1 进度通知

```typescript
interface ProgressUpdate {
  stage: string;
  progress: number; // 0-100
  message: string;
  details?: {
    currentAgent?: string;
    currentTool?: string;
    elapsedTime?: number;
    estimatedRemaining?: number;
  };
}

// WebSocket 推送
class ProgressNotifier {
  private clients: Map<string, WebSocket> = new Map();
  
  subscribe(sessionId: string, ws: WebSocket): void {
    this.clients.set(sessionId, ws);
  }
  
  notify(sessionId: string, update: ProgressUpdate): void {
    const ws = this.clients.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'progress',
        payload: update,
      }));
    }
  }
}
```

### 7.2 确认对话框

```typescript
interface ConfirmationRequest {
  question: string;
  options: Array<{
    label: string;
    value: string;
    default?: boolean;
  }>;
  timeout?: number; // 秒，超时自动选择默认
}

async function requestConfirmation(
  sessionId: string,
  request: ConfirmationRequest
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 发送确认请求到前端
    notifier.notify(sessionId, {
      type: 'confirmation',
      payload: request,
    });
    
    // 等待用户响应
    const handler = (response: any) => {
      if (response.sessionId === sessionId && response.type === 'confirmation') {
        resolve(response.value);
      }
    };
    
    messageBus.on('confirmation', handler);
    
    // 超时处理
    if (request.timeout) {
      setTimeout(() => {
        messageBus.off('confirmation', handler);
        const defaultOption = request.options.find(o => o.default);
        resolve(defaultOption?.value || request.options[0].value);
      }, request.timeout * 1000);
    }
  });
}
```

---

## 8. 部署架构

### 8.1 服务组件

```
┌─────────────────────────────────────────────────────────┐
│                    Production Deployment                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐                                        │
│  │   Frontend  │  React + Vite                         │
│  │   (Web UI)  │  - 图片上传                            │
│  │             │  - 3D 预览                              │
│  │             │  - 进度监控                            │
│  └──────┬──────┘                                        │
│         │ WebSocket/HTTP                                │
│         ▼                                                │
│  ┌─────────────┐                                        │
│  │   API       │  Express/Fastify                      │
│  │   Gateway   │  - 认证授权                            │
│  │             │  - 速率限制                            │
│  │             │  - 请求路由                            │
│  └──────┬──────┘                                        │
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Agent Workers (集群)                    ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          ││
│  │  │ Worker 1 │  │ Worker 2 │  │ Worker N │          ││
│  │  │ - Orch   │  │ - Orch   │  │ - Orch   │          ││
│  │  │ - Vision │  │ - Vision │  │ - Vision │          ││
│  │  │ - Design │  │ - Design │  │ - Design │          ││
│  │  │ - ...    │  │ - ...    │  │ - ...    │          ││
│  │  └──────────┘  └──────────┘  └──────────┘          ││
│  └─────────────────────────────────────────────────────┘│
│         │                                                │
│         ▼                                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │              External Services                       ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          ││
│  │  │   LLM    │  │  OpenSCAD│  │  Bambu   │          ││
│  │  │  (Qwen)  │  │  Server  │  │   API    │          ││
│  │  └──────────┘  └──────────┘  └──────────┘          ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 8.2 配置文件示例

```yaml
# config/production.yaml
server:
  port: 3000
  host: 0.0.0.0

llm:
  provider: bailian
  model: qwen-vl-max
  apiKey: ${QWEN_API_KEY}
  maxTokens: 4096
  temperature: 0.7

openscad:
  serverUrl: http://localhost:8080
  timeout: 60000

bambu:
  connection: lan # lan | cloud
  printerId: ${DEFAULT_PRINTER_ID}
  accessCode: ${ Bambu_ACCESS_CODE}

storage:
  type: s3
  bucket: newsdiscovery-artifacts
  region: cn-shanghai
  
database:
  type: postgres
  host: localhost
  port: 5432
  database: newsdiscovery
  
redis:
  host: localhost
  port: 6379
  
logging:
  level: info
  format: json
  output: stdout
```

---

## 附录

### A. 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/furuif/newsdiscovery
cd newsdiscovery

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API keys

# 4. 启动开发服务器
pnpm dev

# 5. 访问 Web UI
open http://localhost:3000
```

### B. API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/session` | POST | 创建新会话 |
| `/api/session/:id` | GET | 获取会话状态 |
| `/api/session/:id/image` | POST | 上传图片 |
| `/api/session/:id/process` | POST | 开始处理 |
| `/api/session/:id/cancel` | POST | 取消处理 |
| `/api/printers` | GET | 列出打印机 |
| `/api/models/:id/download` | GET | 下载 3D 模型 |

### C. 相关文档

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - 项目计划
- [API_RESEARCH.md](./API_RESEARCH.md) - AI API 调研
- [BAMBU_ECOLOGY.md](./BAMBU_ECOLOGY.md) - 拓竹生态
- [BLOKS_GUIDE.md](./BLOKS_GUIDE.md) - 布鲁可指南
- [AI_WORKFLOW_PATTERNS.md](./AI_WORKFLOW_PATTERNS.md) - 工作流模式

---

*文档版本：1.0 | 最后更新：2026-03-11*
