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

  // 创建 Express 应用
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

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
      const { imageUrl, description, targetSize } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_IMAGE', message: '缺少图片 URL' },
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

  // 前端路由（生产环境）
  if (config.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../web/dist/index.html'));
    });
  }

  // 创建 HTTP 服务器
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

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
  logger.error('未捕获的异常', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝', { reason, promise });
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，优雅关闭中...');
  process.exit(0);
});

main().catch(console.error);
