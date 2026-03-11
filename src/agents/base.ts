/**
 * Agent 基类和工作流引擎
 * 实现 AGENT_TOOL_DESIGN.md 中的 Agent 架构
 */

import { 
  AgentDefinition, 
  AgentContext, 
  SessionState,
  ProgressUpdate,
  AppError,
  ErrorType,
} from '../types/index.js';
import { ToolExecutor } from '../tools/registry.js';

// Agent 基类
export abstract class BaseAgent implements AgentDefinition {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract systemPrompt: string;
  abstract tools: string[];

  constructor(
    protected toolExecutor: ToolExecutor,
    protected logger: { info: (msg: string, data?: any) => void; error: (msg: string, data?: any) => void }
  ) {}

  abstract handler(input: any, context: AgentContext): Promise<any>;

  // 工具调用辅助方法
  protected async callTool(toolName: string, params: any, sessionId: string): Promise<any> {
    return this.toolExecutor.execute(toolName, params, {
      sessionId,
      requestApproval: async (question: string) => {
        // 实际实现会通过 WebSocket 请求用户确认
        console.log(`[Approval Request] ${question}`);
        return true; // 默认批准
      },
      log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        this.logger.info(`[${this.name}] ${message}`);
      },
    });
  }

  // 发送进度更新
  protected async sendProgress(context: AgentContext, message: string, progress: number): Promise<void> {
    await context.sendProgress(message, progress);
  }

  // 请求用户确认
  protected async requestConfirmation(context: AgentContext, question: string, options: string[]): Promise<string> {
    return context.requestApproval(question, options);
  }
}

// 工作流引擎
export interface WorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  condition: (context: WorkflowContext) => boolean;
  action?: (context: WorkflowContext) => Promise<void>;
}

export enum WorkflowState {
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

export class WorkflowContext {
  constructor(
    public sessionId: string,
    public state: SessionState,
    private onUpdate: (updates: Partial<SessionState>) => Promise<void>,
    private onProgress: (message: string, progress: number) => Promise<void>,
    private onLog: (message: string, data?: any) => void
  ) {}

  async updateState(updates: Partial<SessionState>): Promise<void> {
    await this.onUpdate(updates);
    this.state = { ...this.state, ...updates };
  }

  emit(event: string, data?: any): void {
    this.onLog(`Event: ${event}`, data);
  }

  log(message: string, data?: any): void {
    this.onLog(message, data);
  }

  async callAgent(agentId: string, input: any): Promise<any> {
    this.log(`Calling agent: ${agentId}`, input);
    // 实际实现会调用 Agent 执行器
    return { agentId, input };
  }

  async sendProgress(message: string, progress: number): Promise<void> {
    await this.onProgress(message, progress);
  }
}

export class WorkflowEngine {
  private state: WorkflowState = WorkflowState.INIT;
  private transitions: WorkflowTransition[] = [];

  constructor(
    private agents: Map<string, BaseAgent>,
    private logger: { info: (msg: string, data?: any) => void; error: (msg: string, data?: any) => void }
  ) {
    this.setupTransitions();
  }

  private setupTransitions(): void {
    this.transitions = [
      {
        from: WorkflowState.INIT,
        to: WorkflowState.VISION_ANALYSIS,
        condition: () => true,
        action: async (ctx) => {
          await ctx.sendProgress('开始视觉分析...', 10);
        },
      },
      {
        from: WorkflowState.VISION_ANALYSIS,
        to: WorkflowState.BRICK_DESIGN,
        condition: (ctx) => !!ctx.state.artifacts.visionAnalysis,
        action: async (ctx) => {
          await ctx.sendProgress('开始积木设计...', 30);
        },
      },
      {
        from: WorkflowState.BRICK_DESIGN,
        to: WorkflowState.VALIDATION,
        condition: (ctx) => !!ctx.state.artifacts.brickModel,
        action: async (ctx) => {
          await ctx.sendProgress('开始结构验证...', 50);
        },
      },
      {
        from: WorkflowState.VALIDATION,
        to: WorkflowState.MODEL_GENERATION,
        condition: (ctx) => {
          const report = ctx.state.artifacts.validationReport;
          return report && (report.overall === 'pass' || report.overall === 'conditional_pass');
        },
        action: async (ctx) => {
          await ctx.sendProgress('开始 3D 模型生成...', 70);
        },
      },
      {
        from: WorkflowState.VALIDATION,
        to: WorkflowState.BRICK_DESIGN,
        condition: (ctx) => {
          const report = ctx.state.artifacts.validationReport;
          return report && report.overall === 'fail' && ctx.state.workflow.iterationCount < 3;
        },
        action: async (ctx) => {
          await ctx.sendProgress('验证失败，重新设计...', 40);
          await ctx.updateState({
            workflow: {
              ...ctx.state.workflow,
              iterationCount: ctx.state.workflow.iterationCount + 1,
            },
          });
        },
      },
      {
        from: WorkflowState.MODEL_GENERATION,
        to: WorkflowState.PRINT_PREPARATION,
        condition: (ctx) => !!ctx.state.artifacts.generatedModel,
        action: async (ctx) => {
          await ctx.sendProgress('准备打印...', 85);
        },
      },
      {
        from: WorkflowState.PRINT_PREPARATION,
        to: WorkflowState.PRINTING,
        condition: (ctx) => true,
        action: async (ctx) => {
          await ctx.sendProgress('开始打印...', 90);
        },
      },
      {
        from: WorkflowState.PRINTING,
        to: WorkflowState.COMPLETED,
        condition: (ctx) => ctx.state.artifacts.printResult?.status === 'completed',
        action: async (ctx) => {
          await ctx.sendProgress('打印完成！', 100);
        },
      },
      {
        from: WorkflowState.PRINTING,
        to: WorkflowState.FAILED,
        condition: (ctx) => ctx.state.artifacts.printResult?.status === 'failed',
      },
    ];
  }

  async run(context: WorkflowContext): Promise<SessionState> {
    this.state = WorkflowState.INIT;
    this.logger.info(`Workflow started for session: ${context.sessionId}`);

    while (this.state !== WorkflowState.COMPLETED && this.state !== WorkflowState.FAILED) {
      const transition = this.transitions.find(t =>
        t.from === this.state && t.condition(context)
      );

      if (!transition) {
        const error = `No valid transition from state: ${this.state}`;
        this.logger.error(error);
        this.state = WorkflowState.FAILED;
        await context.updateState({
          status: 'failed',
          workflow: {
            ...context.state.workflow,
            lastError: error,
          },
        });
        break;
      }

      if (transition.action) {
        await transition.action(context);
      }

      this.state = transition.to;
      this.logger.info(`Workflow transition: ${transition.from} -> ${transition.to}`);

      // 执行对应状态的 Agent
      await this.executeAgentForState(this.state, context);
    }

    return context.state;
  }

  private async executeAgentForState(state: WorkflowState, context: WorkflowContext): Promise<void> {
    const agentMap: Record<WorkflowState, string | null> = {
      [WorkflowState.INIT]: null,
      [WorkflowState.VISION_ANALYSIS]: 'vision_agent',
      [WorkflowState.BRICK_DESIGN]: 'design_agent',
      [WorkflowState.VALIDATION]: 'validation_agent',
      [WorkflowState.MODEL_GENERATION]: 'generator_agent',
      [WorkflowState.PRINT_PREPARATION]: 'bambu_agent',
      [WorkflowState.PRINTING]: 'bambu_agent',
      [WorkflowState.COMPLETED]: null,
      [WorkflowState.FAILED]: null,
    };

    const agentId = agentMap[state];
    if (agentId) {
      const agent = this.agents.get(agentId);
      if (agent) {
        await context.updateState({
          workflow: {
            ...context.state.workflow,
            currentAgent: agentId,
            completedAgents: [...context.state.workflow.completedAgents, agentId],
          },
        });

        const input = this.prepareAgentInput(state, context.state);
        const result = await agent.handler(input, this.createAgentContext(context));
        
        await this.processAgentResult(state, result, context);
      }
    }
  }

  private prepareAgentInput(state: WorkflowState, stateData: SessionState): any {
    switch (state) {
      case WorkflowState.VISION_ANALYSIS:
        return {
          imageUrl: stateData.input.imageUrl,
          description: stateData.input.description,
          targetSize: stateData.input.targetSize,
        };
      case WorkflowState.BRICK_DESIGN:
        return {
          analysis: stateData.artifacts.visionAnalysis,
          constraints: {},
        };
      case WorkflowState.VALIDATION:
        return {
          model: stateData.artifacts.brickModel,
        };
      case WorkflowState.MODEL_GENERATION:
        return {
          model: stateData.artifacts.brickModel,
          options: { format: 'stl', tolerance: 0.05 },
        };
      case WorkflowState.PRINT_PREPARATION:
      case WorkflowState.PRINTING:
        return {
          modelPath: stateData.artifacts.generatedModel?.files[0]?.path,
          settings: stateData.artifacts.validationReport?.printSettings,
        };
      default:
        return {};
    }
  }

  private createAgentContext(workflowContext: WorkflowContext): AgentContext {
    return {
      sessionId: workflowContext.sessionId,
      state: workflowContext.state,
      log: (message: string, data?: any) => workflowContext.log(message, data),
      callAgent: async (agentId: string, input: any) => workflowContext.callAgent(agentId, input),
      callTool: async (toolName: string, params: any) => {
        // 需要通过 ToolExecutor 调用
        return {};
      },
      updateState: async (updates: Partial<SessionState>) => workflowContext.updateState(updates),
      requestApproval: async (question: string, options: string[]) => {
        console.log(`[Approval] ${question}`);
        return options[0];
      },
      sendProgress: async (message: string, progress: number) => {
        await workflowContext.sendProgress(message, progress);
      },
    };
  }

  private async processAgentResult(
    state: WorkflowState,
    result: any,
    context: WorkflowContext
  ): Promise<void> {
    const artifacts: Partial<SessionState['artifacts']> = {};

    switch (state) {
      case WorkflowState.VISION_ANALYSIS:
        artifacts.visionAnalysis = result;
        break;
      case WorkflowState.BRICK_DESIGN:
        artifacts.brickModel = result;
        break;
      case WorkflowState.VALIDATION:
        artifacts.validationReport = result;
        break;
      case WorkflowState.MODEL_GENERATION:
        artifacts.generatedModel = result;
        break;
      case WorkflowState.PRINT_PREPARATION:
      case WorkflowState.PRINTING:
        artifacts.printResult = result;
        break;
    }

    if (Object.keys(artifacts).length > 0) {
      await context.updateState({ artifacts: { ...context.state.artifacts, ...artifacts } });
    }
  }
}

// 错误处理辅助函数
export function createAppError(
  type: ErrorType,
  code: string,
  message: string,
  details?: any
): AppError {
  return {
    type,
    code,
    message,
    details,
    recoverable: type !== 'fatal',
  };
}

export function isRecoverableError(error: any): boolean {
  return error?.recoverable !== false;
}
