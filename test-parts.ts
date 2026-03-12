/**
 * 零件库测试脚本
 */

import { getPartsDatabase } from './src/data/bloks-parts.js';

console.log('🧱 布鲁可零件库测试\n');

const db = getPartsDatabase();

// 测试 1: 获取所有零件
console.log('📦 零件总数:', db.getAllParts().length);

// 测试 2: 按分类统计
const categories = ['brick', 'plate', 'special'] as const;
categories.forEach(cat => {
  const count = db.getPartsByCategory(cat).length;
  console.log(`  - ${cat}: ${count} 个`);
});

// 测试 3: 根据 ID 获取零件
console.log('\n🔍 测试 getPartById:');
const part1x2 = db.getPartById('bloks_1x2');
if (part1x2) {
  console.log(`  ✓ bloks_1x2: ${part1x2.name}`);
  console.log(`    尺寸：${part1x2.dimensions.width}×${part1x2.dimensions.height}×${part1x2.dimensions.depth} mm`);
  console.log(`    重量：${part1x2.weight} g`);
  console.log(`    颜色：${part1x2.colors.join(', ')}`);
}

// 测试 4: 搜索零件
console.log('\n🔎 测试 searchParts:');
const redParts = db.searchParts({ colors: ['#FF0000'] });
console.log(`  红色零件：${redParts.length} 个`);

const brickParts = db.searchParts({ category: 'brick' });
console.log(`  基础砖块：${brickParts.length} 个`);

// 测试 5: 列出所有零件
console.log('\n📋 完整零件列表:');
db.getAllParts().forEach(part => {
  console.log(`  - ${part.id.padEnd(20)} | ${part.name.padEnd(15)} | ${part.dimensions.width}×${part.dimensions.depth} | ${part.colors.length} 色`);
});

console.log('\n✅ 测试完成！');
