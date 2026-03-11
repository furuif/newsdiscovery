/**
 * 工具注册表和执行引擎
 * 实现 AGENT_TOOL_DESIGN.md 中的工具集设计
 */

import { ToolDefinition } from '../types/index.js';
import { z } from 'zod';

export class ToolRegistry {
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

  has(name: string): boolean {
    return this.tools.has(name);
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

// 工具执行上下文
export interface ToolExecutionContext {
  sessionId: string;
  requestApproval: (question: string) => Promise<boolean>;
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
}

// 工具执行器
export class ToolExecutor {
  constructor(
    private registry: ToolRegistry,
    private logger: { info: (msg: string, data?: any) => void; error: (msg: string, data?: any) => void }
  ) {}

  async execute(
    toolName: string,
    params: any,
    context: ToolExecutionContext
  ): Promise<any> {
    const tool = this.registry.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // 检查是否需要用户批准
    if (tool.requiresApproval) {
      const approved = await context.requestApproval(
        `执行工具：${tool.name}\n${tool.description}`
      );
      if (!approved) {
        throw new Error('Tool execution not approved by user');
      }
    }

    // 执行工具
    this.logger.info(`Executing tool: ${toolName}`, { params });
    const startTime = Date.now();

    try {
      const timeout = tool.timeout || 30000;
      const result = await Promise.race([
        tool.handler(params),
        this.timeout(timeout, `Tool ${toolName} timed out after ${timeout}ms`),
      ]);

      const duration = Date.now() - startTime;
      this.logger.info(`Tool completed: ${toolName}`, { duration });

      return result;
    } catch (error) {
      this.logger.error(`Tool failed: ${toolName}`, { error });
      throw error;
    }
  }

  private timeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }
}

// ==================== 基础工具实现 ====================

// 会话管理工具
export function createSessionTools(): ToolDefinition[] {
  return [
    {
      name: 'create_session',
      description: '创建新的处理会话',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: '用户 ID' },
          imageUrl: { type: 'string', description: '输入图片 URL' },
          description: { type: 'string', description: '用户补充描述' },
        },
        required: ['userId', 'imageUrl'],
      },
      returns: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
      handler: async (params: any) => {
        // 实际实现会调用数据库
        return {
          sessionId: `session_${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      },
    },
    {
      name: 'get_session',
      description: '获取会话状态',
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', description: '会话 ID' },
        },
        required: ['sessionId'],
      },
      returns: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          status: { type: 'string' },
          artifacts: { type: 'object' },
        },
      },
      handler: async (params: any) => {
        // TODO: 从数据库获取
        return { sessionId: params.sessionId, status: 'pending' };
      },
    },
    {
      name: 'update_session',
      description: '更新会话状态',
      parameters: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          status: { type: 'string' },
          artifacts: { type: 'object' },
        },
        required: ['sessionId'],
      },
      returns: { type: 'boolean' },
      handler: async (params: any) => {
        // TODO: 更新数据库
        return true;
      },
    },
  ];
}

// Agent 调用工具
export function createAgentTools(): ToolDefinition[] {
  return [
    {
      name: 'call_agent',
      description: '调用指定的 Agent 处理任务',
      parameters: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'Agent ID' },
          input: { type: 'object', description: '输入数据' },
          options: { type: 'object', description: '调用选项' },
        },
        required: ['agentId', 'input'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        // 实际实现会调用 Agent 执行器
        console.log(`Calling agent: ${params.agentId}`, params.input);
        return { status: 'success', data: {} };
      },
    },
  ];
}

// 用户交互工具
export function createInteractionTools(): ToolDefinition[] {
  return [
    {
      name: 'send_progress',
      description: '向用户发送进度更新',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: '进度消息' },
          progress: { type: 'number', description: '进度百分比 (0-100)' },
          details: { type: 'object', description: '详细信息' },
        },
        required: ['message', 'progress'],
      },
      returns: { type: 'boolean' },
      handler: async (params: any) => {
        console.log(`[Progress ${params.progress}%] ${params.message}`);
        return true;
      },
    },
    {
      name: 'request_confirmation',
      description: '请求用户确认',
      parameters: {
        type: 'object',
        properties: {
          question: { type: 'string', description: '确认问题' },
          options: { type: 'array', items: { type: 'string' }, description: '选项列表' },
        },
        required: ['question', 'options'],
      },
      returns: { type: 'string' },
      handler: async (params: any) => {
        // 实际实现会通过 WebSocket 等待用户响应
        console.log(`[Confirmation] ${params.question}`);
        console.log(`Options: ${params.options.join(', ')}`);
        return params.options[0]; // 默认返回第一个选项
      },
    },
    {
      name: 'send_result',
      description: '向用户发送最终结果',
      parameters: {
        type: 'object',
        properties: {
          result: { type: 'object', description: '结果数据' },
        },
        required: ['result'],
      },
      returns: { type: 'boolean' },
      handler: async (params: any) => {
        console.log('[Result]', JSON.stringify(params.result, null, 2));
        return true;
      },
    },
  ];
}

// 视觉分析工具（ stub，后续实现）
export function createVisionTools(): ToolDefinition[] {
  return [
    {
      name: 'analyze_image',
      description: '分析输入图片，识别物体和结构',
      parameters: {
        type: 'object',
        properties: {
          imageUrl: { type: 'string', description: '图片 URL' },
          options: { type: 'object', description: '分析选项' },
        },
        required: ['imageUrl'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        // TODO: 调用 Qwen-VL API
        return {
          objectType: 'unknown',
          confidence: 0.5,
          dimensions: { estimated: { width: 100, height: 100, depth: 100 }, scale: 1 },
          structure: { symmetry: 'none', layers: 1, hasOverhangs: false, hasHollowParts: false, complexity: 'simple' },
          features: [],
          colors: [],
          notes: ['待实现'],
        };
      },
    },
    {
      name: 'estimate_dimensions',
      description: '基于图片估算物体尺寸',
      parameters: {
        type: 'object',
        properties: {
          imageAnalysis: { type: 'object' },
          reference: { type: 'string', description: '参照物' },
        },
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { width: 100, height: 100, depth: 100 };
      },
    },
    {
      name: 'extract_features',
      description: '提取图片中的结构特征',
      parameters: {
        type: 'object',
        properties: {
          imageAnalysis: { type: 'object' },
        },
        required: ['imageAnalysis'],
      },
      returns: { type: 'array' },
      handler: async (params: any) => {
        return [];
      },
    },
  ];
}

// 积木设计工具（stub，后续实现）
export function createBrickDesignTools(): ToolDefinition[] {
  return [
    {
      name: 'search_parts',
      description: '从零件库搜索零件',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'object', description: '搜索条件' },
        },
        required: ['query'],
      },
      returns: { type: 'array' },
      handler: async (params: any) => {
        // TODO: 查询零件数据库
        return [];
      },
    },
    {
      name: 'get_part_by_id',
      description: '根据 ID 获取零件详情',
      parameters: {
        type: 'object',
        properties: {
          partId: { type: 'string', description: '零件 ID' },
        },
        required: ['partId'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return null;
      },
    },
    {
      name: 'place_brick',
      description: '放置一个积木零件',
      parameters: {
        type: 'object',
        properties: {
          partId: { type: 'string' },
          position: { type: 'array', items: { type: 'number' } },
          rotation: { type: 'array', items: { type: 'number' } },
          color: { type: 'string' },
        },
        required: ['partId', 'position', 'rotation', 'color'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return {
          id: `part_${Date.now()}`,
          ...params,
          connections: [],
        };
      },
    },
    {
      name: 'optimize_structure',
      description: '优化积木结构',
      parameters: {
        type: 'object',
        properties: {
          model: { type: 'object' },
        },
        required: ['model'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { optimized: true, changes: [] };
      },
    },
    {
      name: 'check_connections',
      description: '检查积木连接强度',
      parameters: {
        type: 'object',
        properties: {
          model: { type: 'object' },
        },
        required: ['model'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { stable: true, weakPoints: [] };
      },
    },
  ];
}

// 结构验证工具（stub）
export function createValidationTools(): ToolDefinition[] {
  return [
    {
      name: 'analyze_stability',
      description: '分析结构稳定性',
      parameters: {
        type: 'object',
        properties: {
          model: { type: 'object' },
        },
        required: ['model'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { score: 0.8, stable: true };
      },
    },
    {
      name: 'check_printability',
      description: '检查 3D 打印可行性',
      parameters: {
        type: 'object',
        properties: {
          model: { type: 'object' },
        },
        required: ['model'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { printable: true, issues: [] };
      },
    },
    {
      name: 'simulate_assembly',
      description: '模拟拼装过程',
      parameters: {
        type: 'object',
        properties: {
          model: { type: 'object' },
        },
        required: ['model'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { feasible: true, steps: [] };
      },
    },
  ];
}

// 3D 模型生成工具（stub）
export function createGeneratorTools(): ToolDefinition[] {
  return [
    {
      name: 'generate_openscad',
      description: '生成 OpenSCAD 代码',
      parameters: {
        type: 'object',
        properties: {
          model: { type: 'object' },
        },
        required: ['model'],
      },
      returns: { type: 'string' },
      handler: async (params: any) => {
        return '// OpenSCAD code placeholder';
      },
    },
    {
      name: 'export_stl',
      description: '导出 STL 文件',
      parameters: {
        type: 'object',
        properties: {
          mesh: { type: 'object' },
          options: { type: 'object' },
        },
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { path: '/tmp/model.stl', size: 1024 };
      },
    },
    {
      name: 'apply_tolerance',
      description: '应用公差补偿',
      parameters: {
        type: 'object',
        properties: {
          mesh: { type: 'object' },
          tolerance: { type: 'number' },
        },
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return params.mesh;
      },
    },
  ];
}

// 拓竹打印工具（stub）
export function createBambuTools(): ToolDefinition[] {
  return [
    {
      name: 'list_printers',
      description: '列出可用的拓竹打印机',
      parameters: { type: 'object', properties: {} },
      returns: { type: 'array' },
      handler: async () => {
        return [];
      },
    },
    {
      name: 'slice_model',
      description: '切片 3D 模型',
      parameters: {
        type: 'object',
        properties: {
          modelPath: { type: 'string' },
          settings: { type: 'object' },
        },
        required: ['modelPath', 'settings'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { gcodePath: '/tmp/model.gcode', time: 3600 };
      },
    },
    {
      name: 'send_print_job',
      description: '发送打印任务',
      parameters: {
        type: 'object',
        properties: {
          job: { type: 'object' },
        },
        required: ['job'],
      },
      returns: { type: 'string' },
      handler: async (params: any) => {
        return 'job_123';
      },
    },
    {
      name: 'monitor_print',
      description: '监控打印进度',
      parameters: {
        type: 'object',
        properties: {
          jobId: { type: 'string' },
        },
        required: ['jobId'],
      },
      returns: { type: 'object' },
      handler: async (params: any) => {
        return { progress: 50, timeRemaining: 1800 };
      },
    },
  ];
}

// 创建完整的工具注册表
export function createToolRegistry(): { registry: ToolRegistry; executor: ToolExecutor } {
  const registry = new ToolRegistry();
  const logger = {
    info: (msg: string, data?: any) => console.log(`[Tool] ${msg}`, data || ''),
    error: (msg: string, data?: any) => console.error(`[Tool Error] ${msg}`, data || ''),
  };

  // 注册所有工具
  const allTools = [
    ...createSessionTools(),
    ...createAgentTools(),
    ...createInteractionTools(),
    ...createVisionTools(),
    ...createBrickDesignTools(),
    ...createValidationTools(),
    ...createGeneratorTools(),
    ...createBambuTools(),
  ];

  allTools.forEach(tool => registry.register(tool));

  const executor = new ToolExecutor(registry, logger);

  return { registry, executor };
}
