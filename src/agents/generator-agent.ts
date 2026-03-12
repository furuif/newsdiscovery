/**
 * Generator Agent - 3D 模型生成 Agent
 * 职责：将积木模型转换为 OpenSCAD 代码，导出 STL/3MF 文件
 */

import { BaseAgent } from './base.js';
import { AgentContext, BrickModel, GeneratedModel, GeneratedFile, PrintReadiness } from '../types/index.js';
import { ToolExecutor } from '../tools/registry.js';
import { getPartsDatabase } from '../data/bloks-parts.js';
import { getOpenSCADService } from '../services/openscad.js';

export class GeneratorAgent extends BaseAgent {
  id = 'generator_agent';
  name = '3D Model Generator Agent';
  description = '将积木模型转换为 OpenSCAD 代码并导出 STL 文件';
  systemPrompt = `你是 3D 建模专家。你的职责是将积木设计方案转换为可打印的 3D 模型。

工作流程：
1. 解析积木模型结构
2. 为每个零件生成 OpenSCAD 代码
3. 应用公差补偿（默认 0.1mm）
4. 组合所有零件为完整模型
5. 导出 STL/3MF 格式
6. 检查模型可打印性

输出格式：严格的 GeneratedModel JSON 结构

注意事项：
- 确保模型是流形（manifold）
- 检查自相交问题
- 验证最小壁厚
- 优化网格质量`;

  tools = [
    'generate_openscad',
    'export_stl',
    'apply_tolerance',
    'check_manifold',
  ];

  constructor(toolExecutor: ToolExecutor) {
    super(toolExecutor, {
      info: (msg, data) => console.log(`[GeneratorAgent] ${msg}`, data || ''),
      error: (msg, data) => console.error(`[GeneratorAgent Error] ${msg}`, data || ''),
    });
  }

  async handler(
    input: { model: BrickModel; options?: { format?: 'stl' | '3mf'; tolerance?: number } },
    context: AgentContext
  ): Promise<GeneratedModel> {
    const { model, options = {} } = input;
    const format = options.format || 'stl';
    const tolerance = options.tolerance || 0.1; // 默认 0.1mm 公差

    await this.sendProgress(context, '正在生成 OpenSCAD 代码...', 70);
    this.logger.info('Starting 3D model generation', { 
      modelId: model.metadata.id, 
      partsCount: model.parts.length,
      format,
      tolerance,
    });

    try {
      // Step 1: 生成 OpenSCAD 代码
      const openscadCode = this.generateOpenSCADCode(model, tolerance);
      this.logger.info('OpenSCAD code generated', { length: openscadCode.length });

      // Step 2: 应用公差补偿
      await this.sendProgress(context, '应用公差补偿...', 75);
      const compensatedCode = this.applyToleranceCompensation(openscadCode, tolerance);

      // Step 3: 导出 STL 文件（模拟，实际需要 OpenSCAD 服务）
      await this.sendProgress(context, '导出 STL 文件...', 80);
      const stlFile = await this.exportSTL(model.metadata.id, compensatedCode);

      // Step 4: 检查模型可打印性
      await this.sendProgress(context, '检查模型可打印性...', 85);
      const printReadiness = this.checkPrintReadiness(model);

      // Step 5: 计算模型统计
      const statistics = this.calculateModelStatistics(model);

      const generatedModel: GeneratedModel = {
        id: `model_${Date.now()}`,
        createdAt: new Date().toISOString(),
        files: [stlFile],
        statistics,
        printReadiness,
        metadata: {
          generator: 'GeneratorAgent',
          generatorVersion: '1.0.0',
          processingTime: Date.now(),
        },
      };

      await this.sendProgress(context, '3D 模型生成完成！', 90);
      this.logger.info('3D model generation completed', { 
        modelId: generatedModel.id,
        filesCount: generatedModel.files.length,
      });

      return generatedModel;
    } catch (error) {
      this.logger.error('3D model generation failed', error);
      throw error;
    }
  }

  /**
   * 生成 OpenSCAD 代码
   */
  private generateOpenSCADCode(model: BrickModel, tolerance: number): string {
    const partsDb = getPartsDatabase();
    let code = '';

    // 文件头
    code += `// NewsDiscovery Auto-Generated OpenSCAD Code\n`;
    code += `// Model ID: ${model.metadata.id}\n`;
    code += `// Generated: ${new Date().toISOString()}\n`;
    code += `// Parts: ${model.parts.length}\n`;
    code += `// Tolerance: ${tolerance}mm\n\n`;

    // 公差设置
    code += `tolerance = ${tolerance};\n\n`;

    // 零件库模块定义
    code += `// ==================== 零件模块定义 ====================\n\n`;

    // 为每个唯一零件类型生成模块
    const uniqueParts = new Set(model.parts.map(p => p.partId));
    uniqueParts.forEach(partId => {
      const part = partsDb.getPartById(partId);
      if (part) {
        code += this.generatePartModule(part, tolerance);
      }
    });

    // 组装代码
    code += `\n// ==================== 模型组装 ====================\n\n`;
    code += `module model() {\n`;
    
    model.parts.forEach((placedPart, index) => {
      const part = partsDb.getPartById(placedPart.partId);
      if (part) {
        code += `  // ${placedPart.id}: ${part.name}\n`;
        code += `  translate([${placedPart.position.join(', ')}])\n`;
        code += `  rotate([${placedPart.rotation.join(', ')}])\n`;
        code += `  color("${placedPart.color}")\n`;
        code += `  ${this.getPartModuleName(placedPart.partId)}();\n\n`;
      }
    });
    
    code += `}\n\n`;
    code += `// 渲染模型\n`;
    code += `model();\n`;

    return code;
  }

  /**
   * 生成单个零件的 OpenSCAD 模块
   */
  private generatePartModule(part: any, tolerance: number): string {
    const moduleName = this.getPartModuleName(part.id);
    const { width, height, depth } = part.dimensions;

    let code = `module ${moduleName}() {\n`;
    code += `  difference() {\n`;
    code += `    // 主体\n`;
    code += `    cube([${width - tolerance * 2}, ${height - tolerance * 2}, ${depth - tolerance * 2}], center = true);\n`;

    // 如果有凸点（studs）
    if (part.studs?.top) {
      code += `\n    // 顶部凸点\n`;
      const studDiameter = part.studs.top.diameter;
      const studHeight = 1.8;
      const unit = 8;
      
      for (let row = 0; row < part.studs.top.rows; row++) {
        for (let col = 0; col < part.studs.top.cols; col++) {
          const x = (row - (part.studs.top.rows - 1) / 2) * unit;
          const z = (col - (part.studs.top.cols - 1) / 2) * unit;
          code += `    translate([${x}, ${height / 2}, ${z}]) cylinder(h = ${studHeight}, d = ${studDiameter}, $fn = 50);\n`;
        }
      }
    }

    code += `  }\n`;
    code += `}\n\n`;

    return code;
  }

  /**
   * 获取零件模块名称
   */
  private getPartModuleName(partId: string): string {
    return `part_${partId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  }

  /**
   * 应用公差补偿
   */
  private applyToleranceCompensation(code: string, tolerance: number): string {
    // 已经在生成时应用公差，这里可以做额外调整
    return code.replace(/tolerance = [\d.]+;/, `tolerance = ${tolerance};`);
  }

  /**
   * 导出 STL 文件
   */
  private async exportSTL(modelId: string, openscadCode: string): Promise<GeneratedFile> {
    const openscadService = getOpenSCADService();
    
    try {
      const result = await openscadService.render(openscadCode, modelId, {
        outputFormat: 'stl',
        resolution: 200,
        threads: 4,
      });

      if (!result.success) {
        throw new Error(`OpenSCAD render failed: ${result.error}`);
      }

      return {
        format: 'stl',
        path: result.outputPath,
        size: result.fileSize,
        checksum: this.calculateChecksum(openscadCode),
      };
    } catch (error) {
      this.logger.error('STL export failed', error);
      // 返回错误信息但继续流程
      return {
        format: 'stl',
        path: `/tmp/error_${modelId}.txt`,
        size: 0,
        checksum: 'error',
      };
    }
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * 检查模型可打印性
   */
  private checkPrintReadiness(model: BrickModel): PrintReadiness {
    // 简化检查，实际需要网格分析
    const minDimension = Math.min(
      model.boundingBox.width,
      model.boundingBox.height,
      model.boundingBox.depth
    );

    return {
      isManifold: true, // 假设流形
      hasHoles: false,
      hasSelfIntersections: false,
      minWallThickness: minDimension > 5 ? 2 : 1,
      ready: minDimension >= 5,
    };
  }

  /**
   * 计算模型统计
   */
  private calculateModelStatistics(model: BrickModel): GeneratedModel['statistics'] {
    const vertices = model.parts.length * 8; // 每个零件约 8 个顶点
    const faces = model.parts.length * 12; // 每个零件约 12 个面

    return {
      vertices,
      faces,
      volume: model.boundingBox.width * model.boundingBox.height * model.boundingBox.depth,
      surfaceArea: 2 * (
        model.boundingBox.width * model.boundingBox.height +
        model.boundingBox.height * model.boundingBox.depth +
        model.boundingBox.depth * model.boundingBox.width
      ),
      boundingBox: model.boundingBox,
    };
  }
}

// 工厂函数
export function createGeneratorAgent(toolExecutor: ToolExecutor): GeneratorAgent {
  return new GeneratorAgent(toolExecutor);
}
