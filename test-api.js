#!/usr/bin/env node
/**
 * NewsDiscovery API 测试脚本
 */

const BASE_URL = 'http://localhost:3000';

async function testHealth() {
  console.log('🏥 测试健康检查...');
  const res = await fetch(`${BASE_URL}/health`);
  const data = await res.json();
  console.log('  ✓', data);
  return data.status === 'ok';
}

async function testCreateSession() {
  console.log('\n📸 测试创建会话...');
  
  const res = await fetch(`${BASE_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: 'https://example.com/test-image.jpg',
      description: '一个可爱的小猫',
      targetSize: { width: 100, height: 80, depth: 60 },
    }),
  });
  
  const data = await res.json();
  console.log('  响应:', JSON.stringify(data, null, 2));
  
  if (data.success) {
    console.log('  ✓ 会话创建成功:', data.data.sessionId);
    return data.data.sessionId;
  } else {
    console.log('  ✗ 会话创建失败');
    return null;
  }
}

async function testGetSession(sessionId) {
  if (!sessionId) return;
  
  console.log('\n📊 测试获取会话状态...');
  const res = await fetch(`${BASE_URL}/api/session/${sessionId}`);
  const data = await res.json();
  console.log('  响应:', JSON.stringify(data, null, 2));
}

async function main() {
  console.log('🚀 NewsDiscovery API 测试\n');
  console.log('='.repeat(50));
  
  try {
    // 测试 1: 健康检查
    const healthOk = await testHealth();
    if (!healthOk) {
      console.log('\n❌ 健康检查失败，服务可能未启动');
      return;
    }
    
    // 测试 2: 创建会话
    const sessionId = await testCreateSession();
    
    // 测试 3: 获取会话状态
    await testGetSession(sessionId);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ 所有测试完成！\n');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('请确保服务已启动：pnpm dev');
  }
}

main();
