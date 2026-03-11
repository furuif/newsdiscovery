/**
 * NewsDiscovery - 核心类型定义
 * 基于 AGENT_TOOL_DESIGN.md 的数据格式规范
 */

// ==================== 基础类型 ====================

export type Vector3 = [number, number, number];

export type SymmetryType = 'none' | 'horizontal' | 'vertical' | 'radial';

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export type WorkflowStatus = 
  | 'pending'
  | 'analyzing'
  | 'designing'
  | 'validating'
  | 'generating'
  | 'printing'
  | 'completed'
  | 'failed';

export type ValidationStatus = 'pass' | 'conditional_pass' | 'fail';

export type IssueSeverity = 'critical' | 'major' | 'minor';

// ==================== 视觉分析类型 ====================

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface VisualFeature {
  name: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  size: 'small' | 'medium' | 'large';
}

export interface ColorDistribution {
  name: string;
  hexCode: string;
  coverage: number; // 0-1
}

export interface VisualAnalysis {
  objectType: string;
  category: 'animal' | 'building' | 'vehicle' | 'character' | 'other';
  confidence: number; // 0-1
  
  dimensions: {
    estimated: Dimensions;
    scale: number;
  };
  
  structure: {
    symmetry: SymmetryType;
    layers: number;
    hasOverhangs: boolean;
    hasHollowParts: boolean;
    complexity: ComplexityLevel;
  };
  
  features: VisualFeature[];
  colors: ColorDistribution[];
  notes: string[];
}

// ==================== 积木零件类型 ====================

export interface PartDimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'mm';
}

export interface StudConfig {
  rows: number;
  cols: number;
  diameter: number;
}

export interface TubeConfig {
  count: number;
  diameter: number;
  positions: Vector3[];
}

export interface Part {
  id: string;
  name: string;
  category: string;
  dimensions: PartDimensions;
  studs?: {
    top: StudConfig | null;
    bottom: StudConfig | null;
  };
  tubes?: TubeConfig;
  weight: number; // grams
  material: string;
  colors: string[];
  printSettings?: {
    layerHeight: number;
    infill: number;
    support: boolean;
  };
  modelFile?: string;
}

export interface PlacedPart {
  id: string;
  partId: string;
  position: Vector3;
  rotation: Vector3;
  color: string;
  connections: string[];
}

export interface Layer {
  index: number;
  height: number;
  parts: string[];
}

export interface WeakPoint {
  partId: string;
  position: Vector3;
  reason: string;
}

export interface BrickModel {
  metadata: {
    id: string;
    createdAt: string;
    version: number;
    basedOn: string;
  };
  
  parts: PlacedPart[];
  
  statistics: {
    totalParts: number;
    uniqueParts: number;
    totalVolume: number;
    estimatedWeight: number;
    estimatedCost: number;
    buildTime: number;
  };
  
  layers: Layer[];
  
  stability: {
    score: number;
    weakPoints: WeakPoint[];
    recommendations: string[];
  };
  
  boundingBox: Dimensions;
}

// ==================== 验证类型 ====================

export interface ValidationCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  details: string;
  suggestion?: string;
}

export interface ValidationIssue {
  severity: IssueSeverity;
  description: string;
  location?: {
    partId: string;
    position: Vector3;
  };
  suggestion: string;
}

export interface PrintSettings {
  layerHeight: number;
  infill: number;
  support: boolean;
  supportDensity: number;
  printSpeed: number;
}

export interface ValidationReport {
  overall: ValidationStatus;
  score: number;
  checks: ValidationCheck[];
  issues: ValidationIssue[];
  recommendations: string[];
  printSettings?: PrintSettings;
}

// ==================== 3D 模型生成类型 ====================

export interface GeneratedFile {
  format: 'stl' | '3mf' | 'obj';
  path: string;
  size: number;
  checksum: string;
}

export interface PrintReadiness {
  isManifold: boolean;
  hasHoles: boolean;
  hasSelfIntersections: boolean;
  minWallThickness: number;
  ready: boolean;
}

export interface GeneratedModel {
  id: string;
  createdAt: string;
  files: GeneratedFile[];
  statistics: {
    vertices: number;
    faces: number;
    volume: number;
    surfaceArea: number;
    boundingBox: Dimensions;
  };
  printReadiness: PrintReadiness;
  metadata: {
    generator: string;
    generatorVersion: string;
    processingTime: number;
  };
}

// ==================== 打印类型 ====================

export type PrintJobStatus = 
  | 'queued'
  | 'slicing'
  | 'printing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface SliceSettings {
  layerHeight: number;
  wallLoops: number;
  topSurfaceLayers: number;
  bottomSurfaceLayers: number;
  infillDensity: number;
  infillPattern: 'grid' | 'lines' | 'triangles' | 'gyroid';
  supportEnabled: boolean;
  supportType: 'normal' | 'tree';
  supportDensity: number;
  printSpeed: number;
  material: 'PLA' | 'PETG' | 'ABS' | 'TPU';
  nozzleTemperature: number;
  bedTemperature: number;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
}

export interface PrintProgress {
  percentage: number;
  currentLayer: number;
  totalLayers: number;
  timeElapsed: number;
  timeRemaining: number;
}

export interface PrintResult {
  jobId: string;
  status: PrintJobStatus;
  printer: Printer;
  timeline: {
    queuedAt?: string;
    slicingStartedAt?: string;
    slicingCompletedAt?: string;
    printingStartedAt?: string;
    completedAt?: string;
  };
  progress: PrintProgress;
  output: {
    gcodePath?: string;
    gcodeSize?: number;
    timelapsePath?: string;
    printedParts?: string[];
  };
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
}

// ==================== 会话类型 ====================

export interface SessionInput {
  imageUrl: string;
  description?: string;
  targetSize?: Dimensions;
}

export interface SessionArtifacts {
  visionAnalysis?: VisualAnalysis;
  brickModel?: BrickModel;
  validationReport?: ValidationReport;
  generatedModel?: GeneratedModel;
  printResult?: PrintResult;
}

export interface SessionState {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: WorkflowStatus;
  input: SessionInput;
  workflow: {
    currentAgent: string;
    completedAgents: string[];
    iterationCount: number;
    lastError?: string;
  };
  artifacts: SessionArtifacts;
  metadata: {
    totalProcessingTime: number;
    llmCalls: number;
    toolCalls: number;
    tokenUsage: {
      input: number;
      output: number;
    };
  };
}

// ==================== Agent 类型 ====================

export interface AgentContext {
  sessionId: string;
  state: SessionState;
  log: (message: string, data?: any) => void;
  callAgent: (agentId: string, input: any) => Promise<any>;
  callTool: (toolName: string, params: any) => Promise<any>;
  updateState: (updates: Partial<SessionState>) => Promise<void>;
  requestApproval: (question: string, options: string[]) => Promise<string>;
  sendProgress: (message: string, progress: number) => Promise<void>;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  handler: (input: any, context: AgentContext) => Promise<any>;
}

// ==================== 工具类型 ====================

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any; // JSON Schema
  returns: any; // JSON Schema
  handler: (params: any) => Promise<any>;
  requiresApproval?: boolean;
  timeout?: number;
}

export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  get(name: string): ToolDefinition | undefined;
  list(): ToolDefinition[];
  toLLMFormat(): any[];
}

// ==================== 进度通知类型 ====================

export interface ProgressUpdate {
  stage: string;
  progress: number;
  message: string;
  details?: {
    currentAgent?: string;
    currentTool?: string;
    elapsedTime?: number;
    estimatedRemaining?: number;
  };
}

export interface ConfirmationRequest {
  question: string;
  options: Array<{
    label: string;
    value: string;
    default?: boolean;
  }>;
  timeout?: number;
}

// ==================== 错误类型 ====================

export type ErrorType = 
  | 'transient'
  | 'validation'
  | 'resource'
  | 'fatal'
  | 'user_cancel'
  | 'timeout';

export interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
}

// ==================== API 请求/响应类型 ====================

export interface CreateSessionRequest {
  imageUrl: string;
  description?: string;
  targetSize?: Dimensions;
}

export interface CreateSessionResponse {
  sessionId: string;
  status: WorkflowStatus;
  createdAt: string;
}

export interface SessionStatusResponse {
  sessionId: string;
  status: WorkflowStatus;
  progress: number;
  currentStage: string;
  artifacts: SessionArtifacts;
  error?: AppError;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}
