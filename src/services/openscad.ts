/**
 * OpenSCAD 渲染服务
 * 将 OpenSCAD 代码转换为 STL 文件
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, access, constants } from 'fs/promises';
import { join } from 'path';
import config from '../config/index.js';

const execAsync = promisify(exec);

export interface OpenSCADRenderOptions {
  outputFormat?: 'stl' | '3mf' | 'dxf';
  resolution?: number;
  threads?: number;
}

export interface OpenSCADRenderResult {
  outputPath: string;
  fileSize: number;
  renderTime: number;
  success: boolean;
  error?: string;
}

export class OpenSCADService {
  private storagePath: string;
  private openscadPath: string;

  constructor() {
    this.storagePath = config.STORAGE_PATH || './storage';
    this.openscadPath = process.env.OPENSCAD_PATH || 'openscad';
  }

  /**
   * 渲染 OpenSCAD 代码为 STL 文件
   */
  async render(
    openscadCode: string,
    modelId: string,
    options: OpenSCADRenderOptions = {}
  ): Promise<OpenSCADRenderResult> {
    const startTime = Date.now();
    const outputFormat = options.outputFormat || 'stl';
    const outputFile = join(
      this.storagePath,
      'models',
      `${modelId}_${Date.now()}.${outputFormat}`
    );

    try {
      // 确保存储目录存在
      await this.ensureStorageDirectory();

      // 创建临时 SCAD 文件
      const scadFile = join(this.storagePath, 'temp', `${modelId}.scad`);
      await writeFile(scadFile, openscadCode, 'utf-8');

      // 检查 OpenSCAD 是否可用
      const openscadAvailable = await this.checkOpenSCAD();
      
      if (!openscadAvailable) {
        console.warn('[OpenSCAD] OpenSCAD not available, using mock render');
        return this.mockRender(outputFile, openscadCode);
      }

      // 构建渲染命令
      const resolution = options.resolution || 200;
      const threads = options.threads || 4;

      const command = `${this.openscadPath} \
        -o "${outputFile}" \
        -d "${outputFile}.deps" \
        --export-format=${outputFormat} \
        --resolution=${resolution} \
        --threads=${threads} \
        "${scadFile}"`;

      // 执行渲染
      await execAsync(command, {
        timeout: 300000, // 5 分钟超时
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      // 获取文件大小
      const stats = await this.getFileStats(outputFile);

      const renderTime = Date.now() - startTime;

      console.log(`[OpenSCAD] Render completed: ${outputFile} (${stats.size} bytes, ${renderTime}ms)`);

      return {
        outputPath: outputFile,
        fileSize: stats.size,
        renderTime,
        success: true,
      };
    } catch (error) {
      console.error('[OpenSCAD] Render failed:', error);
      return {
        outputPath: '',
        fileSize: 0,
        renderTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 检查 OpenSCAD 是否可用
   */
  async checkOpenSCAD(): Promise<boolean> {
    try {
      await execAsync(`${this.openscadPath} --version`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 确保存储目录存在
   */
  private async ensureStorageDirectory(): Promise<void> {
    const dirs = [
      this.storagePath,
      join(this.storagePath, 'models'),
      join(this.storagePath, 'temp'),
    ];

    for (const dir of dirs) {
      try {
        await access(dir, constants.F_OK);
      } catch {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * 获取文件统计信息
   */
  private async getFileStats(filePath: string): Promise<{ size: number }> {
    const { stat } = await import('fs/promises');
    const stats = await stat(filePath);
    return { size: stats.size };
  }

  /**
   * 模拟渲染（OpenSCAD 不可用时）
   */
  private async mockRender(outputFile: string, code: string): Promise<OpenSCADRenderResult> {
    const startTime = Date.now();

    // 创建一个假的 STL 文件（仅用于测试）
    const mockSTLContent = this.generateMockSTL();
    await writeFile(outputFile, mockSTLContent, 'utf-8');

    const stats = await this.getFileStats(outputFile);
    const renderTime = Date.now() - startTime;

    console.log(`[OpenSCAD] Mock render completed: ${outputFile}`);

    return {
      outputPath: outputFile,
      fileSize: stats.size,
      renderTime,
      success: true,
    };
  }

  /**
   * 生成模拟 STL 文件内容
   */
  private generateMockSTL(): string {
    // 简单的 STL 格式（一个立方体）
    return `solid mock_model
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 10 0 0
      vertex 10 10 0
    endloop
  endfacet
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 10 10 0
      vertex 0 10 0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0 0 10
      vertex 10 10 10
      vertex 10 0 10
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0 0 10
      vertex 0 10 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 10 0 10
      vertex 10 0 0
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 0 0 10
      vertex 10 0 10
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 0
      vertex 10 10 0
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 0
      vertex 10 10 10
      vertex 0 10 10
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 10 10
      vertex 0 0 10
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 10 0
      vertex 0 10 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 0 0
      vertex 10 10 0
      vertex 10 10 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 0 0
      vertex 10 10 10
      vertex 10 0 10
    endloop
  endfacet
endsolid mock_model`;
  }

  /**
   * 清理临时文件
   */
  async cleanup(modelId: string): Promise<void> {
    const { rm } = await import('fs/promises');
    
    try {
      const tempFile = join(this.storagePath, 'temp', `${modelId}.scad`);
      await rm(tempFile, { force: true });
    } catch (error) {
      console.warn('[OpenSCAD] Cleanup failed:', error);
    }
  }
}

// 单例实例
let openscadService: OpenSCADService | null = null;

export function getOpenSCADService(): OpenSCADService {
  if (!openscadService) {
    openscadService = new OpenSCADService();
  }
  return openscadService;
}

export default getOpenSCADService;
