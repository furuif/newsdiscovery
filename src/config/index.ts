/**
 * 配置文件
 */

import { z } from 'zod';

// 环境变量 schema
const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.string().default('development'),
  
  // LLM 配置
  QWEN_API_KEY: z.string().optional(),
  QWEN_MODEL: z.string().default('qwen-vl-max'),
  
  // 拓竹配置
  BAMBU_PRINTER_ID: z.string().optional(),
  BAMBU_ACCESS_CODE: z.string().optional(),
  BAMBU_CONNECTION: z.enum(['lan', 'cloud']).default('lan'),
  
  // 存储配置
  STORAGE_PATH: z.string().default('./storage'),
});

export type Config = z.infer<typeof envSchema>;

function loadConfig(): Config {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 配置验证失败:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();

export default config;
