/**
 * 布鲁可星辰版零件库
 * 基础零件数据定义
 */

import { Part, PartDimensions, StudConfig, TubeConfig, Vector3 } from '../types/index.js';

/**
 * 零件分类
 */
export type PartCategory = 
  | 'brick'        // 基础砖块
  | 'plate'        // 平板
  | 'tile'         // 光面砖
  | 'special'      // 特殊件
  | 'connector'    // 连接件
  | 'decoration';  // 装饰件

/**
 * 零件数据库接口
 */
export interface PartDatabase {
  getPartById(id: string): Part | null;
  searchParts(query: PartSearchQuery): Part[];
  getPartsByCategory(category: PartCategory): Part[];
  getAllParts(): Part[];
}

/**
 * 零件搜索条件
 */
export interface PartSearchQuery {
  category?: PartCategory;
  minSize?: Partial<PartDimensions>;
  maxSize?: Partial<PartDimensions>;
  colors?: string[];
  hasStuds?: boolean;
  hasTubes?: boolean;
}

/**
 * 创建基础砖块零件
 */
function createBrick(
  id: string,
  name: string,
  studsX: number,
  studsY: number,
  height: number = 9.6,
  colors: string[] = ['#FF0000']
): Part {
  const unit = 8; // 布鲁可标准单位 8mm
  
  return {
    id,
    name,
    category: 'brick',
    dimensions: {
      width: studsX * unit,
      height: height,
      depth: studsY * unit,
      unit: 'mm',
    },
    studs: {
      top: {
        rows: studsX,
        cols: studsY,
        diameter: 4.8,
      },
      bottom: null,
    },
    tubes: studsX > 1 && studsY > 1 ? {
      count: (studsX - 1) * (studsY - 1),
      diameter: 6.5,
      positions: generateTubePositions(studsX, studsY, unit),
    } : undefined,
    weight: calculateBrickWeight(studsX, studsY, height),
    material: 'ABS',
    colors,
    printSettings: {
      layerHeight: 0.2,
      infill: 20,
      support: false,
    },
  };
}

/**
 * 创建平板零件
 */
function createPlate(
  id: string,
  name: string,
  studsX: number,
  studsY: number,
  colors: string[] = ['#FF0000']
): Part {
  const unit = 8;
  const height = 3.2; // 平板高度
  
  return {
    id,
    name,
    category: 'plate',
    dimensions: {
      width: studsX * unit,
      height: height,
      depth: studsY * unit,
      unit: 'mm',
    },
    studs: {
      top: {
        rows: studsX,
        cols: studsY,
        diameter: 4.8,
      },
      bottom: null,
    },
    weight: calculateBrickWeight(studsX, studsY, height),
    material: 'ABS',
    colors,
    printSettings: {
      layerHeight: 0.15,
      infill: 25,
      support: false,
    },
  };
}

/**
 * 生成管状支撑位置
 */
function generateTubePositions(studsX: number, studsY: number, unit: number): Vector3[] {
  const positions: Vector3[] = [];
  const offset = unit / 2;
  
  for (let x = 0; x < studsX - 1; x++) {
    for (let y = 0; y < studsY - 1; y++) {
      positions.push([
        (x + 0.5) * unit,
        offset,
        (y + 0.5) * unit,
      ]);
    }
  }
  
  return positions;
}

/**
 * 估算砖块重量（简化计算）
 */
function calculateBrickWeight(studsX: number, studsY: number, height: number): number {
  const volume = studsX * studsY * height * 64; // mm³
  const density = 0.00104; // ABS 密度 g/mm³
  return Math.round(volume * density * 100) / 100; // 克
}

/**
 * 初始化基础零件库
 */
export function createBloksPartsDatabase(): PartDatabase {
  const parts: Part[] = [];

  // ==================== 基础砖块系列 ====================
  
  // 1x1 砖块
  parts.push(createBrick('bloks_1x1', '1x1 基础砖', 1, 1, 9.6, ['#FF0000', '#0066CC', '#FFCC00', '#FFFFFF', '#000000']));
  
  // 1x2 砖块
  parts.push(createBrick('bloks_1x2', '1x2 基础砖', 1, 2, 9.6, ['#FF0000', '#0066CC', '#FFCC00', '#FFFFFF', '#000000', '#00CC66']));
  
  // 1x3 砖块
  parts.push(createBrick('bloks_1x3', '1x3 基础砖', 1, 3, 9.6, ['#FF0000', '#0066CC', '#FFFFFF']));
  
  // 1x4 砖块
  parts.push(createBrick('bloks_1x4', '1x4 基础砖', 1, 4, 9.6, ['#FF0000', '#0066CC', '#FFCC00', '#FFFFFF', '#000000']));
  
  // 2x2 砖块
  parts.push(createBrick('bloks_2x2', '2x2 基础砖', 2, 2, 9.6, ['#FF0000', '#0066CC', '#FFCC00', '#FFFFFF', '#000000', '#00CC66', '#FF6600']));
  
  // 2x3 砖块
  parts.push(createBrick('bloks_2x3', '2x3 基础砖', 2, 3, 9.6, ['#FF0000', '#0066CC', '#FFFFFF']));
  
  // 2x4 砖块
  parts.push(createBrick('bloks_2x4', '2x4 基础砖', 2, 4, 9.6, ['#FF0000', '#0066CC', '#FFCC00', '#FFFFFF', '#000000']));
  
  // 3x3 砖块
  parts.push(createBrick('bloks_3x3', '3x3 基础砖', 3, 3, 9.6, ['#FF0000', '#0066CC', '#FFFFFF']));
  
  // 4x4 砖块
  parts.push(createBrick('bloks_4x4', '4x4 基础砖', 4, 4, 9.6, ['#FF0000', '#0066CC', '#FFFFFF']));

  // ==================== 平板系列 ====================
  
  // 1x2 平板
  parts.push(createPlate('bloks_plate_1x2', '1x2 平板', 1, 2, ['#FF0000', '#0066CC', '#FFFFFF', '#000000']));
  
  // 1x4 平板
  parts.push(createPlate('bloks_plate_1x4', '1x4 平板', 1, 4, ['#FF0000', '#0066CC', '#FFFFFF']));
  
  // 2x2 平板
  parts.push(createPlate('bloks_plate_2x2', '2x2 平板', 2, 2, ['#FF0000', '#0066CC', '#FFCC00', '#FFFFFF', '#000000']));
  
  // 2x4 平板
  parts.push(createPlate('bloks_plate_2x4', '2x4 平板', 2, 4, ['#FF0000', '#0066CC', '#FFFFFF']));
  
  // 4x4 平板
  parts.push(createPlate('bloks_plate_4x4', '4x4 平板', 4, 4, ['#FF0000', '#0066CC', '#FFFFFF']));

  // ==================== 特殊件系列 ====================
  
  // 2x2 斜面砖 (45 度)
  parts.push({
    id: 'bloks_slope_2x2_45',
    name: '2x2 斜面砖 45°',
    category: 'special',
    dimensions: {
      width: 16,
      height: 9.6,
      depth: 16,
      unit: 'mm',
    },
    studs: {
      top: {
        rows: 1,
        cols: 2,
        diameter: 4.8,
      },
      bottom: null,
    },
    weight: 2.5,
    material: 'ABS',
    colors: ['#FF0000', '#0066CC', '#FFFFFF'],
    printSettings: {
      layerHeight: 0.2,
      infill: 20,
      support: true,
    },
  });

  // 2x2 圆弧砖
  parts.push({
    id: 'bloks_curve_2x2',
    name: '2x2 圆弧砖',
    category: 'special',
    dimensions: {
      width: 16,
      height: 9.6,
      depth: 16,
      unit: 'mm',
    },
    studs: {
      top: {
        rows: 2,
        cols: 2,
        diameter: 4.8,
      },
      bottom: null,
    },
    weight: 2.8,
    material: 'ABS',
    colors: ['#FF0000', '#0066CC', '#FFFFFF'],
    printSettings: {
      layerHeight: 0.2,
      infill: 20,
      support: false,
    },
  });

  return {
    getPartById(id: string): Part | null {
      return parts.find(p => p.id === id) || null;
    },

    searchParts(query: PartSearchQuery): Part[] {
      return parts.filter(part => {
        if (query.category && part.category !== query.category) {
          return false;
        }
        if (query.colors && query.colors.length > 0 && !query.colors.some(c => part.colors.includes(c))) {
          return false;
        }
        if (query.hasStuds !== undefined && query.hasStuds && !part.studs?.top) {
          return false;
        }
        if (query.hasTubes !== undefined && query.hasTubes && !part.tubes) {
          return false;
        }
        return true;
      });
    },

    getPartsByCategory(category: PartCategory): Part[] {
      return parts.filter(p => p.category === category);
    },

    getAllParts(): Part[] {
      return [...parts];
    },
  };
}

// 单例实例
let partsDatabase: PartDatabase | null = null;

export function getPartsDatabase(): PartDatabase {
  if (!partsDatabase) {
    partsDatabase = createBloksPartsDatabase();
  }
  return partsDatabase;
}

export default getPartsDatabase;
