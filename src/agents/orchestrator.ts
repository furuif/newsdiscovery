/**
 * Orchestrator Agent - 总控 Agent
 * 职责：接收用户请求，协调各 Agent 工作流，管理会话状态
 */

import { BaseAgent, WorkflowEngine, WorkflowContext, WorkflowState } from './base.js';
import { AgentContext, SessionState } from '../types/index.js';
import { ToolExecutor } from '../tools/registry.js';

export class OrchestratorAgent extends BaseAgent {
  id = 'orchestrator';
  name = 'Orchestrator Agent';
  description = '总控 Agent，协调各专业 Agent 完成完整工作流';
  systemPrompt = `你是 NewsDiscovery 系统的总控 Agent。你的职责是：
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
- 遇到错误时，先尝试自愈，失败则请求人工介入`;

  tools = [
    'create_session',
    'get_session',
    'update_session',
    'call_agent',
    'send_progress',
    'request_confirmation',
    'send_result',
  ];

  private workflowEngine: WorkflowEngine;

  constructor(
    toolExecutor: ToolExecutor,
    agents: Map<string, BaseAgent>
  ) {
    super(toolExecutor, {
      info: (msg, data) => console.log(`[Orchestrator] ${msg}`, data || ''),
      error: (msg, data) => console.error(`[Orchestrator Error] ${msg}`, data || ''),
    });

    this.workflowEngine = new WorkflowEngine(agents, this.logger);
  }

  async handler(input: any, context: AgentContext): Promise<SessionState> {
    const { sessionId, userId, imageUrl, description, targetSize } = input;

    await this.sendProgress(context, '任务已接收，开始处理...', 5);
    this.logger.info('Orchestrator started', { sessionId, userId, imageUrl });

    try {
      // Step 1: 创建会话
      await this.sendProgress(context, '创建会话...', 8);
      const session = await this.callTool(
        'create_session',
        { userId, imageUrl, description },
        sessionId
      );
      this.logger.info('Session created', session);

      // Step 2: 初始化会话状态
      const initialState: SessionState = {
        id: sessionId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'analyzing',
        input: { imageUrl, description, targetSize },
        workflow: {
          currentAgent: 'orchestrator',
          completedAgents: [],
          iterationCount: 0,
        },
        artifacts: {},
        metadata: {
          totalProcessingTime: 0,
          llmCalls: 0,
          toolCalls: 0,
          tokenUsage: { input: 0, output: 0 },
        },
      };

      // Step 3: 创建工作流上下文
      const workflowContext = new WorkflowContext(
        sessionId,
        initialState,
        async (updates) => {
          await this.callTool('update_session', { sessionId, ...updates }, sessionId);
          initialState.updatedAt = new Date().toISOString();
          Object.assign(initialState, updates);
        },
        async (message, progress) => {
          await this.sendProgress(context, message, progress);
        },
        (message, data) => this.logger.info(message, data)
      );

      // Step 4: 运行工作流引擎
      await this.sendProgress(context, '启动工作流引擎...', 10);
      const finalState = await this.workflowEngine.run(workflowContext);

      // Step 5: 发送最终结果
      await this.sendProgress(context, '处理完成！', 100);
      await this.callTool('send_result', { result: finalState }, sessionId);

      this.logger.info('Orchestrator completed', finalState);
      return finalState;
    } catch (error) {
      this.logger.error('Orchestrator failed', error);
      await context.sendProgress('处理失败，请稍后重试', 0);
      throw error;
    }
  }
}

// 工厂函数
export function createOrchestratorAgent(
  toolExecutor: ToolExecutor,
  agents: Map<string, BaseAgent>
): OrchestratorAgent {
  return new OrchestratorAgent(toolExecutor, agents);
}
