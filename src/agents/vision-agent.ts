/**
 * Vision Analysis Agent - 视觉分析 Agent
 * 职责：分析输入图片，识别物体特征，估算尺寸和结构
 */

import { BaseAgent } from './base.js';
import { AgentContext, VisualAnalysis } from '../types/index.js';
import { ToolExecutor } from '../tools/registry.js';

export class VisionAgent extends BaseAgent {
  id = 'vision_agent';
  name = 'Vision Analysis Agent';
  description = '分析图片，识别物体类型、尺寸比例和结构特征';
  systemPrompt = `你是视觉分析专家。你的职责是分析用户提供的图片，输出详细的结构描述。

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
- 标注不确定的部分`;

  tools = [
    'analyze_image',
    'estimate_dimensions',
    'extract_features',
  ];

  constructor(toolExecutor: ToolExecutor) {
    super(toolExecutor, {
      info: (msg, data) => console.log(`[VisionAgent] ${msg}`, data || ''),
      error: (msg, data) => console.error(`[VisionAgent Error] ${msg}`, data || ''),
    });
  }

  async handler(input: any, context: AgentContext): Promise<VisualAnalysis> {
    const { imageUrl, description, targetSize } = input;

    await this.sendProgress(context, '正在分析图片...', 15);
    this.logger.info('Starting vision analysis', { imageUrl, description });

    try {
      // Step 1: 调用图像分析工具
      const imageAnalysis = await this.callTool('analyze_image', { imageUrl }, context.sessionId);
      this.logger.info('Image analysis completed', imageAnalysis);

      // Step 2: 估算尺寸
      const dimensions = await this.callTool(
        'estimate_dimensions',
        { imageAnalysis, reference: 'common object' },
        context.sessionId
      );
      this.logger.info('Dimensions estimated', dimensions);

      // Step 3: 提取特征
      const features = await this.callTool(
        'extract_features',
        { imageAnalysis },
        context.sessionId
      );
      this.logger.info('Features extracted', features);

      // Step 4: 整合结果
      const result: VisualAnalysis = {
        objectType: description || 'unknown object',
        category: this.categorizeObject(description || ''),
        confidence: 0.8,
        dimensions: {
          estimated: targetSize || dimensions || { width: 100, height: 100, depth: 100 },
          scale: 1,
        },
        structure: {
          symmetry: 'none',
          layers: 1,
          hasOverhangs: false,
          hasHollowParts: false,
          complexity: 'medium',
        },
        features: features || [],
        colors: [],
        notes: ['分析结果待完善'],
      };

      await this.sendProgress(context, '视觉分析完成', 25);
      this.logger.info('Vision analysis completed', result);

      return result;
    } catch (error) {
      this.logger.error('Vision analysis failed', error);
      throw error;
    }
  }

  private categorizeObject(description: string): VisualAnalysis['category'] {
    const lower = description.toLowerCase();
    
    if (lower.includes('动物') || lower.includes('animal') || lower.includes('猫') || lower.includes('狗')) {
      return 'animal';
    }
    if (lower.includes('建筑') || lower.includes('building') || lower.includes('房子')) {
      return 'building';
    }
    if (lower.includes('车') || lower.includes('vehicle') || lower.includes('飞机')) {
      return 'vehicle';
    }
    if (lower.includes('人') || lower.includes('character') || lower.includes('角色')) {
      return 'character';
    }
    
    return 'other';
  }
}

// 工厂函数
export function createVisionAgent(toolExecutor: ToolExecutor): VisionAgent {
  return new VisionAgent(toolExecutor);
}
