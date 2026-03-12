/**
 * Validation Agent - 结构验证 Agent
 * 职责：验证积木模型的结构稳定性、可打印性、连接可靠性
 */

import { BaseAgent } from './base.js';
import { AgentContext, BrickModel, ValidationReport, ValidationCheck, ValidationIssue, PrintSettings, ValidationStatus } from '../types/index.js';
import { ToolExecutor } from '../tools/registry.js';

export class ValidationAgent extends BaseAgent {
  id = 'validation_agent';
  name = 'Validation Agent';
  description = '验证积木模型的结构稳定性、可打印性和连接可靠性';
  systemPrompt = `你是结构验证专家。你的职责是全面检查积木模型的设计质量。

验证维度：
1. **结构稳定性**
   - 重心分析：模型是否容易倾倒
   - 连接强度：零件间连接是否牢固
   - 弱点检测：识别潜在的断裂点

2. **可打印性**
   - 悬垂角度：是否需要支撑
   - 最小壁厚：是否满足打印要求
   - 打印方向：推荐最佳打印朝向

3. **拼装可行性**
   - 零件可达性：拼装时是否有足够空间
   - 连接顺序：是否存在无法按顺序拼装的问题
   - 公差配合：零件间隙是否合理

4. **材料效率**
   - 零件数量：是否可以简化
   - 材料用量：是否有浪费
   - 打印时间：估算是否合理

输出格式：严格的 ValidationReport JSON 结构

评分标准：
- 90-100: pass (优秀，可直接打印)
- 70-89: conditional_pass (良好，建议优化但可打印)
- <70: fail (需要重新设计)`;

  tools = [
    'analyze_stability',
    'check_printability',
    'simulate_assembly',
  ];

  constructor(toolExecutor: ToolExecutor) {
    super(toolExecutor, {
      info: (msg, data) => console.log(`[ValidationAgent] ${msg}`, data || ''),
      error: (msg, data) => console.error(`[ValidationAgent Error] ${msg}`, data || ''),
    });
  }

  async handler(input: { model: BrickModel }, context: AgentContext): Promise<ValidationReport> {
    const { model } = input;

    await this.sendProgress(context, '正在验证结构稳定性...', 50);
    this.logger.info('Starting validation', { modelId: model.metadata.id });

    try {
      const checks: ValidationCheck[] = [];
      const issues: ValidationIssue[] = [];
      const recommendations: string[] = [];

      // Step 1: 稳定性检查
      await this.sendProgress(context, '检查结构稳定性...', 55);
      const stabilityCheck = await this.checkStability(model, context);
      checks.push(stabilityCheck);

      // Step 2: 可打印性检查
      await this.sendProgress(context, '检查可打印性...', 60);
      const printabilityCheck = await this.checkPrintability(model, context);
      checks.push(printabilityCheck);

      // Step 3: 拼装可行性检查
      await this.sendProgress(context, '检查拼装可行性...', 65);
      const assemblyCheck = await this.checkAssembly(model, context);
      checks.push(assemblyCheck);

      // Step 4: 连接分析
      await this.sendProgress(context, '分析零件连接...', 70);
      const connectionCheck = await this.analyzeConnections(model, context);
      checks.push(connectionCheck);

      // Step 5: 收集问题和建议
      for (const check of checks) {
        if (check.status === 'fail') {
          issues.push({
            severity: 'critical',
            description: check.details,
            suggestion: check.suggestion || '请重新设计',
          });
        } else if (check.status === 'warning') {
          issues.push({
            severity: 'minor',
            description: check.details,
            suggestion: check.suggestion || '建议优化',
          });
        }
        if (check.suggestion) {
          recommendations.push(check.suggestion);
        }
      }

      // Step 6: 计算总体评分
      await this.sendProgress(context, '计算验证评分...', 75);
      const score = this.calculateScore(checks);
      const overall = this.determineOverall(score, issues);

      // Step 7: 生成打印设置建议
      const printSettings = this.generatePrintSettings(model, checks);

      // Step 8: 添加通用建议
      if (recommendations.length === 0) {
        recommendations.push('设计良好，可以直接打印');
      }

      const report: ValidationReport = {
        overall,
        score,
        checks,
        issues,
        recommendations,
        printSettings,
      };

      await this.sendProgress(context, `验证完成 - 评分：${score}/100`, 80);
      this.logger.info('Validation completed', { score, overall, issuesCount: issues.length });

      return report;
    } catch (error) {
      this.logger.error('Validation failed', error);
      throw error;
    }
  }

  private async checkStability(model: BrickModel, _context: AgentContext): Promise<ValidationCheck> {
    const { stability } = model;
    
    // 检查稳定性评分
    if (stability.score >= 0.8) {
      return {
        name: '结构稳定性',
        status: 'pass',
        details: `稳定性评分 ${stability.score.toFixed(2)}，结构牢固`,
        suggestion: '无需调整',
      };
    } else if (stability.score >= 0.6) {
      return {
        name: '结构稳定性',
        status: 'warning',
        details: `稳定性评分 ${stability.score.toFixed(2)}，存在 ${stability.weakPoints.length} 个弱点`,
        suggestion: '建议增加支撑结构或加宽底座',
      };
    } else {
      return {
        name: '结构稳定性',
        status: 'fail',
        details: `稳定性评分 ${stability.score.toFixed(2)}，结构不稳定`,
        suggestion: '需要重新设计，增加底座面积或降低重心',
      };
    }
  }

  private async checkPrintability(model: BrickModel, _context: AgentContext): Promise<ValidationCheck> {
    const { boundingBox, parts } = model;
    
    // 检查悬垂结构
    const hasLargeOverhangs = parts.some(part => {
      // 简化检查：如果零件在 Z 轴方向有较大偏移，可能需要支撑
      return part.position[2] > 0 && part.rotation.some(r => r > 45);
    });

    // 检查最小尺寸
    const minDimension = Math.min(boundingBox.width, boundingBox.height, boundingBox.depth);
    const isTooSmall = minDimension < 5; // 小于 5mm 可能难以打印

    if (hasLargeOverhangs && isTooSmall) {
      return {
        name: '可打印性',
        status: 'fail',
        details: '存在大角度悬垂且尺寸过小',
        suggestion: '调整模型角度或添加支撑结构，确保最小尺寸大于 5mm',
      };
    } else if (hasLargeOverhangs) {
      return {
        name: '可打印性',
        status: 'warning',
        details: '存在悬垂结构，可能需要支撑',
        suggestion: '建议使用树状支撑或调整打印角度',
      };
    } else if (isTooSmall) {
      return {
        name: '可打印性',
        status: 'warning',
        details: `最小尺寸 ${minDimension.toFixed(1)}mm，接近打印极限`,
        suggestion: '建议放大模型或简化细节',
      };
    } else {
      return {
        name: '可打印性',
        status: 'pass',
        details: '模型适合 FDM 打印',
        suggestion: '无需调整',
      };
    }
  }

  private async checkAssembly(model: BrickModel, _context: AgentContext): Promise<ValidationCheck> {
    const { layers, parts } = model;
    
    // 检查层数是否合理
    const layerCount = layers.length;
    const totalParts = parts.length;
    
    // 检查是否有孤立的零件（没有连接）
    const isolatedParts = parts.filter(part => part.connections.length === 0);
    
    if (isolatedParts.length > 0) {
      return {
        name: '拼装可行性',
        status: 'fail',
        details: `发现 ${isolatedParts.length} 个孤立零件，没有与其他零件连接`,
        suggestion: '确保所有零件都有有效连接',
      };
    } else if (layerCount > 20) {
      return {
        name: '拼装可行性',
        status: 'warning',
        details: `模型有 ${layerCount} 层，拼装复杂度较高`,
        suggestion: '考虑简化设计或分层打印',
      };
    } else {
      return {
        name: '拼装可行性',
        status: 'pass',
        details: `共 ${layerCount} 层 ${totalParts} 个零件，拼装顺序清晰`,
        suggestion: '无需调整',
      };
    }
  }

  private async analyzeConnections(model: BrickModel, _context: AgentContext): Promise<ValidationCheck> {
    const { parts } = model;
    
    // 检查连接质量
    const wellConnected = parts.filter(part => part.connections.length >= 2).length;
    const connectionRatio = wellConnected / parts.length;
    
    if (connectionRatio >= 0.8) {
      return {
        name: '零件连接',
        status: 'pass',
        details: `${(connectionRatio * 100).toFixed(0)}% 的零件有良好连接`,
        suggestion: '连接设计优秀',
      };
    } else if (connectionRatio >= 0.5) {
      return {
        name: '零件连接',
        status: 'warning',
        details: `${(connectionRatio * 100).toFixed(0)}% 的零件有良好连接，部分零件连接不足`,
        suggestion: '增加连接点以提高结构强度',
      };
    } else {
      return {
        name: '零件连接',
        status: 'fail',
        details: `仅 ${(connectionRatio * 100).toFixed(0)}% 的零件有良好连接`,
        suggestion: '需要重新设计连接结构',
      };
    }
  }

  private calculateScore(checks: ValidationCheck[]): number {
    const scoreMap = {
      'pass': 100,
      'warning': 70,
      'fail': 40,
    };
    
    const totalScore = checks.reduce((sum, check) => {
      return sum + scoreMap[check.status];
    }, 0);
    
    return Math.round(totalScore / checks.length);
  }

  private determineOverall(score: number, issues: ValidationIssue[]): ValidationStatus {
    const hasCriticalIssues = issues.some(issue => issue.severity === 'critical');
    
    if (hasCriticalIssues) {
      return 'fail';
    } else if (score >= 90) {
      return 'pass';
    } else if (score >= 70) {
      return 'conditional_pass';
    } else {
      return 'fail';
    }
  }

  private generatePrintSettings(_model: BrickModel, checks: ValidationCheck[]): PrintSettings {
    // 根据验证结果生成推荐的打印设置
    const hasOverhangs = checks.some(c => 
      c.name === '可打印性' && c.status !== 'pass'
    );
    
    return {
      layerHeight: 0.2, // 标准层高
      infill: 20, // 20% 填充
      support: hasOverhangs, // 有悬垂时启用支撑
      supportDensity: 15, // 支撑密度 15%
      printSpeed: 50, // 50mm/s 打印速度
    };
  }
}

// 工厂函数
export function createValidationAgent(toolExecutor: ToolExecutor): ValidationAgent {
  return new ValidationAgent(toolExecutor);
}
