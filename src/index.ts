/**
 * NewsDiscovery - 主入口
 * AI 图片到积木建模系统
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createToolRegistry } from './tools/registry.js';
import { createVisionAgent } from './agents/vision-agent.js';
import { createDesignAgent } from './agents/design-agent.js';
import { createValidationAgent } from './agents/validation-agent.js';
import { createGeneratorAgent } from './agents/generator-agent.js';
import { createOrchestratorAgent } from './agents/orchestrator.js';

const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

async function main() {
  logger.info('🚀 启动 NewsDiscovery 服务...');

  // 创建工具注册表
  const { registry: toolRegistry, executor: toolExecutor } = createToolRegistry();
  logger.info(`✅ 已注册 ${toolRegistry.list().length} 个工具`);

  // 创建 Agent 实例
  const agents = new Map();
  
  const visionAgent = createVisionAgent(toolExecutor);
  agents.set(visionAgent.id, visionAgent);
  logger.info(`✅ Vision Agent 就绪`);

  const designAgent = createDesignAgent(toolExecutor);
  agents.set(designAgent.id, designAgent);
  logger.info(`✅ Design Agent 就绪`);

  const validationAgent = createValidationAgent(toolExecutor);
  agents.set(validationAgent.id, validationAgent);
  logger.info(`✅ Validation Agent 就绪`);

  const generatorAgent = createGeneratorAgent(toolExecutor);
  agents.set(generatorAgent.id, generatorAgent);
  logger.info(`✅ Generator Agent 就绪`);

  const orchestrator = createOrchestratorAgent(toolExecutor, agents);
  agents.set(orchestrator.id, orchestrator);
  logger.info(`✅ Orchestrator Agent 就绪`);

  // 创建 HTTP 服务器和 Socket.IO（提前初始化以在路由中使用）
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // 服务静态文件（生产环境）
  if (config.NODE_ENV === 'production') {
    const webDistPath = path.join(__dirname, '../../web/dist');
    app.use(express.static(webDistPath));
  }

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API 路由
  app.post('/api/session', async (req, res) => {
    try {
      let imageUrl: string;
      let description: string;
      let targetSize: any;

      // 处理文件上传或 JSON 数据
      if (req.file) {
        // 从 FormData 上传
        imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        description = req.body.description || '未提供描述';
        targetSize = JSON.parse(req.body.targetSize || '{}');
      } else {
        // 从 JSON 上传
        imageUrl = req.body.imageUrl;
        description = req.body.description || '未提供描述';
        targetSize = req.body.targetSize;
      }
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_IMAGE', message: '缺少图片' },
        });
      }

      const sessionId = `session_${Date.now()}`;
      
      // 启动处理流程（异步）
      orchestrator.handler(
        { sessionId, userId: 'user_1', imageUrl, description, targetSize },
        {
          sessionId,
          state: {} as any,
          log: (msg, data) => logger.info(msg, data),
          callAgent: async () => ({}),
          callTool: async () => ({}),
          updateState: async () => {},
          requestApproval: async () => 'yes',
          sendProgress: async (msg, progress) => {
            logger.info(`[${progress}%] ${msg}`);
            // 通过 WebSocket 推送进度
            io.to(sessionId).emit('progress', { message: msg, progress });
          },
        }
      ).catch(err => {
        logger.error('Session processing failed', err);
        io.to(sessionId).emit('error', { error: err.message });
      });

      res.json({
        success: true,
        data: { sessionId, status: 'pending', createdAt: new Date().toISOString() },
      });
    } catch (error) {
      logger.error('Create session failed', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' },
      });
    }
  });

  app.get('/api/session/:id', (req, res) => {
    // TODO: 从数据库获取会话状态
    res.json({
      success: true,
      data: {
        sessionId: req.params.id,
        status: 'processing',
        progress: 50,
        currentStage: 'design',
        artifacts: {},
      },
    });
  });

  // 文件下载 API
  app.get('/api/session/:sessionId/download/:fileId', async (req, res) => {
    const { sessionId, fileId } = req.params;
    const { format } = req.query;
    
    try {
      const pathMod = await import('path');
      const { stat } = await import('fs/promises');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = pathMod.dirname(__filename);
      
      // 构建文件路径 (从 src/index.ts 到 storage/models)
      const modelsDir = pathMod.join(__dirname, '../storage/models');
      const filePattern = fileId.includes('.') ? fileId : `${fileId}.${format || 'stl'}`;
      let filePath = pathMod.join(modelsDir, filePattern);
      
      logger.info(`尝试下载文件：${filePath}`);
      
      // 检查文件是否存在
      try {
        await stat(filePath);
      } catch (error) {
        // 尝试查找匹配的文件
        const { readdir } = await import('fs/promises');
        const files = await readdir(modelsDir);
        logger.info(`modelsDir 中的文件：${files.join(', ')}`);
        const matchedFile = files.find(f => f.startsWith(fileId));
        
        if (!matchedFile) {
          return res.status(404).json({
            success: false,
            error: { code: 'FILE_NOT_FOUND', message: '文件不存在' },
          });
        }
        
        filePath = pathMod.join(modelsDir, matchedFile);
        logger.info(`找到匹配文件：${filePath}`);
      }
      
      // 获取文件信息
      const stats = await stat(filePath);
      const fileName = pathMod.basename(filePath);
      
      // 设置响应头
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', stats.size);
      
      // 发送文件
      const { createReadStream } = await import('fs');
      const stream = createReadStream(filePath);
      stream.pipe(res);
      
      logger.info(`文件下载：${fileName} (${stats.size} bytes)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`文件下载失败：${errorMsg}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: { code: 'DOWNLOAD_ERROR', message: errorMsg },
        });
      }
    }
  });

  // 批量下载 API（打包为 zip）
  app.get('/api/session/:sessionId/download-all', async (req, res) => {
    const { sessionId } = req.params;
    
    try {
      const pathMod = await import('path');
      const { readdir, stat } = await import('fs/promises');
      const { fileURLToPath } = await import('url');
      const { default: archiver } = await import('archiver');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = pathMod.dirname(__filename);
      
      const modelsDir = pathMod.join(__dirname, '../storage/models');
      const files = await readdir(modelsDir);
      const matchedFiles = files.filter(f => f.startsWith(sessionId));
      
      if (matchedFiles.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NO_FILES_FOUND', message: '未找到相关文件' },
        });
      }
      
      // 创建 ZIP 文件
      const zipFileName = `${sessionId}_models.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      
      // 添加文件到 ZIP
      for (const file of matchedFiles) {
        const filePath = pathMod.join(modelsDir, file);
        const fileStats = await stat(filePath);
        if (fileStats.isFile()) {
          archive.file(filePath, { name: file });
        }
      }
      
      await archive.finalize();
      logger.info(`批量下载：${zipFileName} (${matchedFiles.length} files)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`批量下载失败：${errorMsg}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: { code: 'BATCH_DOWNLOAD_ERROR', message: errorMsg },
        });
      }
    }
  });

  // 前端路由（生产环境）
  if (config.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
    });
  }

  // WebSocket 连接处理
  io.on('connection', (socket) => {
    logger.info(`🔌 WebSocket 连接：${socket.id}`);

    socket.on('join', (sessionId: string) => {
      socket.join(sessionId);
      logger.info(`用户加入会话：${sessionId}`);
    });

    socket.on('confirmation_response', (data: { sessionId: string; value: string }) => {
      logger.info('用户确认响应', data);
      // 处理用户确认
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 WebSocket 断开：${socket.id}`);
    });
  });

  // 启动服务器
  const port = config.PORT;
  httpServer.listen(port, () => {
    logger.info(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🤖 NewsDiscovery 服务已启动                            ║
║                                                          ║
║   HTTP:    http://localhost:${port}                       ║
║   WebSocket: ws://localhost:${port}                       ║
║   环境：   ${config.NODE_ENV}                                     ║
║                                                          ║
║   已加载 Agent: ${agents.size} 个                                   ║
║   已注册工具：${toolRegistry.list().length} 个                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
  });
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason);
  console.error('Promise:', promise);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，优雅关闭中...');
  process.exit(0);
});

main().catch(console.error);
