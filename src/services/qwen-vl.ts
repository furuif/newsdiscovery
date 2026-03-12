/**
 * Qwen-VL 视觉分析服务
 * 基于阿里云百炼 API
 */

import axios from 'axios';
import config from '../config/index.js';

export interface QwenVLRequest {
  imageUrl: string;
  prompt?: string;
}

export interface QwenVLResponse {
  content: string;
  confidence?: number;
  objects?: DetectedObject[];
  description?: string;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  bbox?: [number, number, number, number]; // [x1, y1, x2, y2]
}

export class QwenVLService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://dashscope.aliyuncs.com/api/v1';

  constructor() {
    this.apiKey = config.QWEN_API_KEY || '';
    this.model = config.QWEN_MODEL || 'qwen-vl-max';
  }

  /**
   * 分析图片
   * @param imageUrl 图片 URL
   * @param prompt 分析提示词
   */
  async analyzeImage(imageUrl: string, prompt?: string): Promise<QwenVLResponse> {
    if (!this.apiKey) {
      console.warn('[QwenVL] API key not configured, using mock response');
      return this.mockAnalyzeImage(imageUrl);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/services/aigc/multimodal-generation/generation`,
        {
          model: this.model,
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  { image: imageUrl },
                  { text: prompt || this.getDefaultPrompt() },
                ],
              },
            ],
          },
          parameters: {
            result_format: 'message',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return this.parseResponse(response.data);
    } catch (error) {
      console.error('[QwenVL] API call failed:', error);
      throw new Error(`Qwen-VL API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取默认分析提示词
   */
  private getDefaultPrompt(): string {
    return `请详细分析这张图片：

1. **物体识别**：这是什么物体？（动物、建筑、车辆、人物等）
2. **结构特征**：
   - 整体形状和比例
   - 对称性（无/水平/垂直/径向）
   - 分层结构（如果有，描述每层特征）
   - 突出部分（耳朵、翅膀、轮子等）
   - 空洞/镂空部分
3. **尺寸估算**：基于常见参照物估算实际尺寸（宽×高×深，单位 cm）
4. **复杂度**：简单/中等/复杂
5. **颜色分析**：主要颜色及其分布

请以 JSON 格式输出，包含以下字段：
{
  "objectType": "物体名称",
  "category": "animal|building|vehicle|character|other",
  "confidence": 0.0-1.0,
  "dimensions": { "width": 数字，"height": 数字，"depth": 数字 },
  "structure": {
    "symmetry": "none|horizontal|vertical|radial",
    "layers": 数字，
    "hasOverhangs": true/false,
    "hasHollowParts": true/false,
    "complexity": "simple|medium|complex"
  },
  "features": [{"name": "特征名", "description": "描述", "position": "位置"}],
  "colors": [{"name": "颜色名", "hexCode": "#RRGGBB", "coverage": 0.0-1.0}],
  "notes": ["注意事项"]
}`;
  }

  /**
   * 解析 API 响应
   */
  private parseResponse(data: any): QwenVLResponse {
    try {
      const content = data.output?.choices?.[0]?.message?.content || '';
      
      // 尝试从响应中提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          content,
          confidence: parsed.confidence || 0.8,
          objects: [],
          description: parsed.objectType || 'unknown',
        };
      }

      return {
        content,
        confidence: 0.7,
        description: content.substring(0, 200),
      };
    } catch (error) {
      console.error('[QwenVL] Failed to parse response:', error);
      return {
        content: data.output?.choices?.[0]?.message?.content || '',
        confidence: 0.5,
      };
    }
  }

  /**
   * 模拟响应（API key 未配置时使用）
   */
  private mockAnalyzeImage(imageUrl: string): QwenVLResponse {
    console.log('[QwenVL] Using mock response for:', imageUrl);
    
    return {
      content: 'Mock analysis - API key not configured',
      confidence: 0.5,
      description: '示例物体（待配置 API key 后获取真实分析）',
      objects: [
        { name: '示例物体', confidence: 0.5 },
      ],
    };
  }

  /**
   * 检查 API 配置
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// 单例实例
let qwenVLService: QwenVLService | null = null;

export function getQwenVLService(): QwenVLService {
  if (!qwenVLService) {
    qwenVLService = new QwenVLService();
  }
  return qwenVLService;
}

export default getQwenVLService;
