# GitHub Issues 列表

**创建日期**: 2026-03-12  
**项目完成度**: 90%  
**优先级**: 🔴 高 | 🟡 中 | 🟢 低

---

## 🔴 高优先级 (High Priority)

### Issue #1: 实现 STL 文件加载器

**标签**: `enhancement` `frontend` `three.js`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
当前 3D 预览显示占位模型（立方体），需要实现真实的 STL 文件加载和渲染。

**任务**:
- [ ] 安装 `three-stdlib` 依赖
- [ ] 实现 STLLoader 组件
- [ ] 支持 STL 文件拖拽上传
- [ ] 添加模型缩放和居中
- [ ] 优化渲染性能

**技术实现**:
```typescript
import { STLLoader } from 'three-stdlib';

const loader = new STLLoader();
const geometry = loader.load('/path/to/model.stl');
const material = new MeshStandardMaterial({ color: '#667eea' });
const mesh = new Mesh(geometry, material);
```

**验收标准**:
- ✅ 能够加载后端生成的 STL 文件
- ✅ 模型正确显示在画布中心
- ✅ 支持旋转、缩放、平移
- ✅ 渲染帧率 > 30fps

**预计工作量**: 4 小时

---

### Issue #2: 实现本地图片上传功能

**标签**: `enhancement` `frontend` `upload`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
当前仅支持图片 URL 输入，需要添加本地文件上传功能。

**任务**:
- [ ] 添加文件输入组件
- [ ] 实现拖拽上传
- [ ] 图片预览和裁剪
- [ ] 文件压缩（可选）
- [ ] 后端文件处理 API

**技术实现**:
```typescript
// 前端
<input type="file" accept="image/*" onChange={handleFileSelect} />

// 后端
app.post('/api/upload', upload.single('image'), (req, res) => {
  // 处理上传的文件
});
```

**验收标准**:
- ✅ 支持 JPG/PNG/GIF 格式
- ✅ 文件大小限制 < 10MB
- ✅ 上传进度显示
- ✅ 上传后自动预览

**预计工作量**: 6 小时

---

### Issue #3: 实现文件下载功能

**标签**: `enhancement` `frontend` `download`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
结果页面的下载按钮当前无响应，需要实现 STL 文件下载功能。

**任务**:
- [ ] 后端文件下载 API
- [ ] 前端下载按钮事件处理
- [ ] 支持批量下载
- [ ] 添加下载进度
- [ ] 文件命名规范化

**API 设计**:
```
GET /api/session/:sessionId/download
GET /api/session/:sessionId/download/stl
GET /api/session/:sessionId/download/3mf
```

**验收标准**:
- ✅ 点击下载按钮开始下载
- ✅ 文件命名包含会话 ID
- ✅ 支持多种格式下载
- ✅ 大文件下载进度显示

**预计工作量**: 3 小时

---

### Issue #4: 实现 Bambu Agent（拓竹打印集成）

**标签**: `enhancement` `backend` `printer` `bambu`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
实现拓竹打印机集成，支持自动切片和打印任务推送。

**任务**:
- [ ] Bambu Lab API 研究
- [ ] 实现 Bambu Agent
- [ ] Cloud API 连接
- [ ] LAN API 连接
- [ ] 切片参数配置
- [ ] 打印任务管理
- [ ] 打印进度监控

**API 集成**:
- Cloud API: https://api.bambulab.com/
- LAN API: 本地网络通信

**验收标准**:
- ✅ 能够列出可用打印机
- ✅ 支持切片参数配置
- ✅ 成功发送打印任务
- ✅ 实时监控打印进度
- ✅ 打印完成通知

**预计工作量**: 16 小时

---

## 🟡 中优先级 (Medium Priority)

### Issue #5: WebSocket 自动重连

**标签**: `bug` `websocket` `reliability`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
当前 WebSocket 断线后需要手动刷新页面，需要实现自动重连逻辑。

**任务**:
- [ ] 检测连接断开
- [ ] 实现指数退避重连
- [ ] 重连状态提示
- [ ] 会话状态恢复
- [ ] 最大重试次数限制

**技术实现**:
```typescript
socket.on('disconnect', () => {
  let retries = 0;
  const maxRetries = 5;
  const delay = Math.min(1000 * Math.pow(2, retries), 30000);
  
  setTimeout(() => {
    if (retries < maxRetries) {
      socket.connect();
      retries++;
    }
  }, delay);
});
```

**验收标准**:
- ✅ 断线后自动尝试重连
- ✅ 重连间隔指数增长
- ✅ 最多重试 5 次
- ✅ 用户友好的状态提示

**预计工作量**: 4 小时

---

### Issue #6: 历史记录功能

**标签**: `enhancement` `frontend` `storage`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
添加历史记录功能，保存用户的处理会话和结果。

**任务**:
- [ ] localStorage 存储
- [ ] 历史会话列表
- [ ] 会话详情查看
- [ ] 结果回放
- [ ] 历史记录清理
- [ ] 搜索和筛选

**数据结构**:
```typescript
interface HistoryItem {
  sessionId: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  status: string;
  result?: any;
}
```

**验收标准**:
- ✅ 自动保存处理历史
- ✅ 列表显示最近 20 条
- ✅ 点击查看详情
- ✅ 支持删除单条/清空
- ✅ 数据持久化

**预计工作量**: 8 小时

---

### Issue #7: 零件库扩展至 50+ 零件

**标签**: `enhancement` `data` `parts`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
当前零件库有 24 个零件，需要扩展到 50+ 个，覆盖更多场景。

**任务**:
- [ ] 添加更多基础砖块尺寸
- [ ] 添加特殊形状件（三角形、圆形等）
- [ ] 添加人仔配件
- [ ] 添加机械零件（齿轮、轴等）
- [ ] 添加装饰件（花草、动物等）
- [ ] 零件 3D 模型文件
- [ ] 零件连接规则完善

**目标分类**:
- 基础砖块：15 个
- 平板：8 个
- 特殊件：10 个
- 轮子/轮胎：5 个
- 门窗：4 个
- 连接件：5 个
- 装饰件：8 个
- 机械件：5 个
- **总计**: 60 个

**验收标准**:
- ✅ 零件总数 >= 50
- ✅ 每个零件有完整数据
- ✅ 支持零件搜索
- ✅ 有 3D 模型文件（可选）

**预计工作量**: 12 小时

---

### Issue #8: 分享功能

**标签**: `enhancement` `frontend` `social`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
添加分享功能，用户可以分享自己的设计作品。

**任务**:
- [ ] 生成分享链接
- [ ] 导出结果图片
- [ ] 社交媒体分享按钮
- [ ] 分享预览卡片
- [ ] 公开作品库（可选）

**分享平台**:
- 微信
- 微博
- Twitter
- Facebook
- 复制链接

**验收标准**:
- ✅ 生成唯一分享链接
- ✅ 导出高质量图片
- ✅ 一键分享到社交平台
- ✅ 分享卡片包含预览图

**预计工作量**: 6 小时

---

## 🟢 低优先级 (Low Priority)

### Issue #9: 性能优化

**标签**: `performance` `optimization`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
优化系统性能，提升用户体验。

**任务**:
- [ ] Agent 并行执行
- [ ] 结果缓存
- [ ] 流式响应
- [ ] 图片懒加载
- [ ] 代码分割
- [ ] 压缩静态资源

**优化目标**:
- API 响应时间 < 200ms
- 页面加载时间 < 1s
- 动画帧率 > 60fps
- 内存占用 < 500MB

**预计工作量**: 10 小时

---

### Issue #10: 多语言支持 (i18n)

**标签**: `enhancement` `i18n`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
添加多语言支持，首先是中英文切换。

**任务**:
- [ ] i18n 框架集成 (react-i18next)
- [ ] 中文语言包
- [ ] 英文语言包
- [ ] 语言切换组件
- [ ] 后端国际化

**支持语言**:
- 简体中文 (zh-CN)
- English (en-US)

**验收标准**:
- ✅ 一键切换语言
- ✅ 所有文本已翻译
- ✅ 日期/数字格式化
- ✅ 语言偏好保存

**预计工作量**: 6 小时

---

### Issue #11: 监控和告警

**标签**: `monitoring` `devops`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
添加系统监控和错误追踪。

**任务**:
- [ ] Prometheus 指标
- [ ] Grafana 仪表盘
- [ ] Sentry 错误追踪
- [ ] 日志聚合
- [ ] 告警规则

**监控指标**:
- API 响应时间
- 错误率
- WebSocket 连接数
- Agent 执行时间
- 内存/CPU 使用率

**预计工作量**: 8 小时

---

### Issue #12: 单元测试

**标签**: `testing` `quality`  
**状态**: 📋 Todo  
**指派**: 无

**描述**:
添加单元测试，提高代码质量。

**任务**:
- [ ] 配置 Jest/Vitest
- [ ] Agent 测试
- [ ] 工具函数测试
- [ ] 类型测试
- [ ] 覆盖率报告

**目标覆盖率**:
- 语句覆盖率 > 80%
- 分支覆盖率 > 70%
- 函数覆盖率 > 80%

**预计工作量**: 12 小时

---

## 📊 统计信息

### 按优先级

| 优先级 | 数量 | 预计工时 |
|--------|------|----------|
| 🔴 高 | 4 | 29 小时 |
| 🟡 中 | 4 | 34 小时 |
| 🟢 低 | 4 | 36 小时 |
| **总计** | **12** | **99 小时** |

### 按标签

| 标签 | 数量 |
|------|------|
| enhancement | 9 |
| frontend | 5 |
| backend | 2 |
| bug | 1 |
| testing | 1 |
| performance | 1 |

---

## 🎯 冲刺计划

### Sprint 1 (本周)
- Issue #1: STL 文件加载器
- Issue #2: 本地图片上传
- Issue #3: 文件下载功能

### Sprint 2 (下周)
- Issue #4: Bambu Agent
- Issue #5: WebSocket 重连
- Issue #6: 历史记录

### Sprint 3 (两周后)
- Issue #7: 零件库扩展
- Issue #8: 分享功能
- Issue #9: 性能优化

---

## 📝 如何参与

1. **选择 Issue**: 根据兴趣和技能选择合适的 Issue
2. **创建分支**: `git checkout -b issue-#<number>-<feature>`
3. **开发实现**: 按照验收标准完成开发
4. **测试验证**: 确保所有测试通过
5. **提交 PR**: 提交 Pull Request 并关联 Issue

---

*Issues 列表 | 最后更新：2026-03-12*
