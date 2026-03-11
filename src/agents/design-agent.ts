/**
 * Brick Design Agent - 积木设计 Agent
 * 职责：将视觉分析结果转换为积木零件组合，设计拼装方案
 */

import { BaseAgent } from './base.js';
import { AgentContext, BrickModel, PlacedPart, Layer } from '../types/index.js';
import { ToolExecutor } from '../tools/registry.js';

export class DesignAgent extends BaseAgent {
  id = 'design_agent';
  name = 'Brick Design Agent';
  description = '将视觉分析结果转换为积木拼装方案';
  systemPrompt = `你是积木设计专家，精通布鲁可星辰版积木系统。你的职责是：
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
- 标注需要特殊处理的零件`;

  tools = [
    'search_parts',
    'get_part_by_id',
    'place_brick',
    'optimize_structure',
    'check_connections',
  ];

  constructor(toolExecutor: ToolExecutor) {
    super(toolExecutor, {
      info: (msg, data) => console.log(`[DesignAgent] ${msg}`, data || ''),
      error: (msg, data) => console.error(`[DesignAgent Error] ${msg}`, data || ''),
    });
  }

  async handler(input: any, context: AgentContext): Promise<BrickModel> {
    const { analysis, constraints } = input;

    await this.sendProgress(context, '开始积木设计...', 35);
    this.logger.info('Starting brick design', { analysis, constraints });

    try {
      const parts: PlacedPart[] = [];
      const layers: Layer[] = [];

      // Step 1: 分析结构，确定基础尺寸
      const { width, height, depth } = analysis.dimensions.estimated;
      this.logger.info('Design dimensions', { width, height, depth });

      // Step 2: 逐层搭建（简化的示例实现）
      const layerHeight = 9.6; // 标准砖块高度
      const totalLayers = Math.ceil(height / layerHeight);

      for (let i = 0; i < totalLayers; i++) {
        await this.buildLayer(
          i,
          { width, height: layerHeight, depth },
          analysis,
          parts,
          context
        );
      }

      // Step 3: 创建分层信息
      for (let i = 0; i < totalLayers; i++) {
        layers.push({
          index: i,
          height: i * layerHeight,
          parts: parts.filter(p => Math.abs(p.position[1] - i * layerHeight) < 1).map(p => p.id),
        });
      }

      // Step 4: 优化结构
      await this.sendProgress(context, '优化结构...', 45);
      const optimized = await this.callTool(
        'optimize_structure',
        { model: { parts, layers, boundingBox: { width, height, depth } } },
        context.sessionId
      );
      this.logger.info('Structure optimized', optimized);

      // Step 5: 检查连接
      await this.sendProgress(context, '检查连接...', 48);
      const connections = await this.callTool(
        'check_connections',
        { model: { parts, layers } },
        context.sessionId
      );
      this.logger.info('Connections checked', connections);

      // Step 6: 构建最终模型
      const result: BrickModel = {
        metadata: {
          id: `model_${Date.now()}`,
          createdAt: new Date().toISOString(),
          version: 1,
          basedOn: analysis.objectType,
        },
        parts,
        statistics: {
          totalParts: parts.length,
          uniqueParts: new Set(parts.map(p => p.partId)).size,
          totalVolume: width * height * depth,
          estimatedWeight: parts.length * 2.5, // 假设每个零件 2.5g
          estimatedCost: parts.length * 0.5, // 假设每个零件 0.5 元
          buildTime: parts.length * 0.5, // 假设每个零件 0.5 分钟
        },
        layers,
        stability: {
          score: connections.stable ? 0.9 : 0.6,
          weakPoints: connections.weakPoints || [],
          recommendations: [],
        },
        boundingBox: { width, height, depth },
      };

      await this.sendProgress(context, '积木设计完成', 50);
      this.logger.info('Brick design completed', result);

      return result;
    } catch (error) {
      this.logger.error('Brick design failed', error);
      throw error;
    }
  }

  private async buildLayer(
    layerIndex: number,
    layerDimensions: { width: number; height: number; depth: number },
    analysis: any,
    parts: PlacedPart[],
    context: AgentContext
  ): Promise<void> {
    // 简化的示例：在每层放置基础砖块
    const brickSize = { width: 15.8, height: 9.6, depth: 7.9 }; // 2x4 标准砖块
    const bricksPerRow = Math.floor(layerDimensions.width / brickSize.width);
    const rowsPerLayer = Math.floor(layerDimensions.depth / brickSize.depth);

    for (let row = 0; row < rowsPerLayer; row++) {
      for (let col = 0; col < bricksPerRow; col++) {
        const part = await this.callTool(
          'place_brick',
          {
            partId: 'bloks_std_brick_2x4',
            position: [
              col * brickSize.width,
              layerIndex * layerDimensions.height,
              row * brickSize.depth,
            ] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            color: 'white',
          },
          context.sessionId
        );
        parts.push(part);
      }
    }

    this.logger.info(`Layer ${layerIndex} built`, { bricks: bricksPerRow * rowsPerLayer });
  }
}

// 工厂函数
export function createDesignAgent(toolExecutor: ToolExecutor): DesignAgent {
  return new DesignAgent(toolExecutor);
}
