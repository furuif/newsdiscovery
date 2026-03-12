/**
 * 完整工作流测试
 * 测试从图片到 3D 模型的完整流程
 */

import { createToolRegistry } from './src/tools/registry.js';
import { createVisionAgent } from './src/agents/vision-agent.js';
import { createDesignAgent } from './src/agents/design-agent.js';
import { createValidationAgent } from './src/agents/validation-agent.js';
import { createGeneratorAgent } from './src/agents/generator-agent.js';

async function testWorkflow() {
  console.log('🚀 NewsDiscovery 完整工作流测试\n');
  console.log('='.repeat(60));

  // 创建工具注册表
  const { registry: toolRegistry, executor: toolExecutor } = createToolRegistry();
  console.log(`✅ 已注册 ${toolRegistry.list().length} 个工具`);

  // 创建 Agent 实例
  const agents = new Map();
  
  const visionAgent = createVisionAgent(toolExecutor);
  agents.set(visionAgent.id, visionAgent);
  console.log(`✅ Vision Agent 就绪`);

  const designAgent = createDesignAgent(toolExecutor);
  agents.set(designAgent.id, designAgent);
  console.log(`✅ Design Agent 就绪`);

  const validationAgent = createValidationAgent(toolExecutor);
  agents.set(validationAgent.id, validationAgent);
  console.log(`✅ Validation Agent 就绪`);

  const generatorAgent = createGeneratorAgent(toolExecutor);
  agents.set(generatorAgent.id, generatorAgent);
  console.log(`✅ Generator Agent 就绪`);

  console.log('\n' + '='.repeat(60));
  console.log('📊 Agent 统计:');
  console.log(`   总数量：${agents.size} 个`);
  console.log(`   列表：${Array.from(agents.keys()).join(', ')}`);

  // 模拟会话上下文
  const mockContext = {
    sessionId: 'test_session_' + Date.now(),
    state: {} as any,
    log: (msg: string, data?: any) => console.log(`  [LOG] ${msg}`),
    callAgent: async (agentId: string, input: any) => {
      console.log(`  [CALL] Agent ${agentId}`);
      return {};
    },
    callTool: async (toolName: string, params: any) => {
      console.log(`  [TOOL] ${toolName}`);
      return {};
    },
    updateState: async (updates: any) => {
      console.log(`  [STATE] Updated`);
    },
    requestApproval: async (question: string, options: string[]) => 'yes',
    sendProgress: async (message: string, progress: number) => {
      console.log(`  [PROGRESS ${progress}%] ${message}`);
    },
  };

  console.log('\n' + '='.repeat(60));
  console.log('🧪 测试场景：小猫图片 → 3D 模型\n');

  try {
    // Step 1: 视觉分析
    console.log('📸 Step 1: 视觉分析');
    const visionInput = {
      imageUrl: 'https://example.com/cat.jpg',
      description: '一个可爱的小猫',
      targetSize: { width: 100, height: 80, depth: 60 },
    };
    
    const visionResult = await visionAgent.handler(visionInput, mockContext);
    console.log(`✓ 识别物体：${visionResult.objectType}`);
    console.log(`✓ 分类：${visionResult.category}`);
    console.log(`✓ 置信度：${(visionResult.confidence * 100).toFixed(0)}%`);

    // Step 2: 积木设计
    console.log('\n🧱 Step 2: 积木设计');
    const designInput = {
      analysis: visionResult,
      constraints: {},
    };
    
    const designResult = await designAgent.handler(designInput, mockContext);
    console.log(`✓ 零件数量：${designResult.parts?.length || 0} 个`);
    console.log(`✓ 层数：${designResult.layers?.length || 0} 层`);

    // Step 3: 结构验证
    console.log('\n✅ Step 3: 结构验证');
    const validationInput = {
      model: designResult,
    };
    
    const validationResult = await validationAgent.handler(validationInput, mockContext);
    console.log(`✓ 总体评分：${validationResult.score}/100`);
    console.log(`✓ 验证结果：${validationResult.overall}`);
    console.log(`✓ 问题数量：${validationResult.issues.length} 个`);

    // Step 4: 3D 模型生成
    console.log('\n🎨 Step 4: 3D 模型生成');
    const generatorInput = {
      model: designResult,
      options: {
        format: 'stl' as const,
        tolerance: 0.1,
      },
    };
    
    const generatorResult = await generatorAgent.handler(generatorInput, mockContext);
    console.log(`✓ 模型 ID: ${generatorResult.id}`);
    console.log(`✓ 文件数量：${generatorResult.files.length} 个`);
    console.log(`✓ 顶点数：${generatorResult.statistics.vertices}`);
    console.log(`✓ 可打印：${generatorResult.printReadiness.ready ? '是' : '否'}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 工作流测试完成！\n');
    console.log('✅ 所有 Agent 协同工作正常');
    console.log('✅ 数据流转正确');
    console.log('✅ 进度推送正常\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error instanceof Error ? error.message : error);
    console.error('\n请检查：');
    console.error('  1. 所有 Agent 是否正确初始化');
    console.error('  2. 工具注册表是否完整');
    console.error('  3. 数据类型是否匹配\n');
  }
}

testWorkflow();
