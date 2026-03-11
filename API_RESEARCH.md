# AI 3D 生成服务 API 调研报告

调研日期：2026 年 3 月 11 日

---

## 一、商业 API 服务对比

| 服务名称 | API 文档链接 | 免费额度 | 付费套餐 | 输入格式 | 输出格式 | 处理时间 | 主要特点/限制 |
|---------|-------------|---------|---------|---------|---------|---------|--------------|
| **Tripo API** | https://www.tripo3d.ai/api<br>https://docs.tripo3d.ai/ | 300  credits/月<br>(基础版，1 并发任务，1 天历史，CC BY 4.0 协议) | Professional: $15.9/月 (年付) 或 $19.9/月 (月付)<br>- 3,000 credits<br>- 商业用途<br>- 优先队列<br><br>Advanced: $39.9/月<br>Premium: $111.9/月 | - 单张图片 (JPG, PNG)<br>- 多视图图片 (前/侧/顶)<br>- 文本描述 | - GLB (推荐，适用于 Web/移动)<br>- GLTF<br>- FBX (适用于动画/游戏)<br>- OBJ (适用于静态模型/3D 打印) | < 1 秒 (TripoSR)<br>数秒至数十秒 (高质量模型) | **特点:**<br>- 业界领先的生成速度<br>- 支持多视图输入提高精度<br>- 自动背景移除<br>- 支持 6 种风格转换 (卡通/粘土/外星人等)<br>- 后处理功能 (多边形控制/格式转换)<br><br>**限制:**<br>- 免费版模型公开 (CC BY 4.0)<br>- HD 纹理消耗更多 credits (40 credits/模型) |
| **CSM (Common Sense Machines)** | https://docs.csm.ai/<br>https://csm.ai/api | Tinkerer 计划:<br>- 5 credits (~5 次生成)<br>- 标准分辨率<br>- GLB 导出<br><br>⚠️ Cube 平台将于 2026 年 1 月 5 日关闭 | Pro: $20/月<br>- 100 模型/月<br>- 高分辨率<br>- 所有导出格式<br>- 纹理生成<br><br>Team: $50/月<br>- 500 模型/月<br>- 3 团队成员<br>- API 访问<br><br>Enterprise: 定制 | - 单张图片<br>- 文本描述<br>- 视频 (部分支持) | - GLB<br>- OBJ<br>- FBX<br>- USDZ | 数分钟 (高峰期可能更慢) | **特点:**<br>- 擅长有机形状和角色<br>- 细节捕捉优秀<br>- 支持将物体分解为可分离部件<br><br>**限制:**<br>- 硬表面/机械对象精度较低<br>- 处理时间较长<br>- Cube 平台即将关闭 |
| **Luma AI** | https://lumalabs.ai/api<br>https://docs.lumalabs.ai/docs/welcome | Free: $0/月<br>- 有限使用<br>- Draft 分辨率<br>- 低优先级<br>- 仅限非商业<br>- 带水印 | Lite: $7.99/月 - 3,200 credits<br>Plus: $23.99/月 - 10,000 credits (可商用，无水印)<br>Unlimited: $75.99/月 - 无限 Relaxed Mode<br>Enterprise: 定制 (20,000 credits) | - 文本<br>- 图片<br>- 视频 | - MP4 (视频)<br>- GLB (3D)<br>- 图片序列 | 视频生成:<br>- 5 秒: 80-640 credits<br>- 10 秒: 160-1280 credits<br><br>3D 生成: 数分钟 | **特点:**<br>- Dream Machine 视频生成领先<br>- Ray2/Ray3 模型<br>- 支持 4K 上采样 + HDR<br>- 高优先级处理<br><br>**限制:**<br>- 主要聚焦视频生成<br>- 免费版带水印且仅限非商业<br>- 按帧计费模式复杂 |
| **Rodin by Deemos (Hyper3D)** | https://developer.hyper3d.ai/<br>https://hyper3d.ai/api | 免费生成和编辑<br>- 不满意不扣 credits<br>- 可重新生成 | 按次付费:<br>- Text-to-3D: ~$0.3/次<br><br>订阅制:<br>- 具体价格需查看官网<br>- 支持直接购买 credits (永久有效) | - 单张图片<br>- 多视图图片 (无需姿势)<br>- 文本描述<br>- 草图 | - GLB<br>- OBJ<br>- FBX<br>- USDZ | 数秒至数分钟<br>(取决于质量设置) | **特点:**<br>- 先出结果后付费模式<br>- 不满意免费重做<br>- 多视图图像到 3D 无需姿势<br>- 支持草图输入<br>- Focal Mode 高细节模式<br><br>**限制:**<br>- 价格相对较高<br>- API 文档较新 |
| **Meshy AI** | https://www.meshy.ai/api<br>https://docs.meshy.ai/en/api/ | 免费试用<br>- 具体额度需查看官网 | Pro ($20/月): 1,000 credits<br>Studio: 定制<br>Enterprise: 定制 (100+ RPS, 50+ 并发)<br><br>API 预付费模式 | - 图片 (JPG, PNG 等)<br>- 文本<br>- 多张图片 | - GLB (主要)<br>- FBX<br>- OBJ<br>- USDZ | 快速生成<br>(业界领先速度) | **特点:**<br>- 业界最快生成速度之一<br>- 支持角色动画<br>- Blender/Unity 插件<br>- ISO27001/SOC2/GDPR 认证<br>- 3MF 导出 (3D 打印)<br><br>**限制:**<br>- API 需预付费<br>- 资产保留 3 天 (Pro 版) |

---

## 二、开源 Image-to-3D 方案

| 项目名称 | GitHub 链接 | 输入格式 | 输出格式 | 处理时间 | 硬件要求 | 主要特点 |
|---------|------------|---------|---------|---------|---------|---------|
| **TripoSR** | https://github.com/VAST-AI-Research/TripoSR | 单张图片 (PNG, JPG) | GLB, OBJ (带纹理) | < 0.5 秒 (NVIDIA A100) | - Python >= 3.8<br>- CUDA (推荐)<br>- ~6GB VRAM | - 与 Stability AI 合作开发<br>- 基于 Large Reconstruction Model (LRM)<br>- 开源模型中速度最快<br>- MIT 许可证<br>- 支持 Gradio 本地部署 |
| **Hunyuan3D 2.1** | https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 | - 单张图片<br>- 文本 | GLB, OBJ | 数秒至数分钟 | - GPU (推荐 NVIDIA)<br>- 较大显存需求 | - 腾讯混元 3D 系统<br>- 两阶段方法 (形状 + 纹理)<br>- 支持高分辨率 3D 资产<br>- 多视图纹理生成管道<br>- 开源模型 |
| **Stable DreamFusion** | https://github.com/ashawkey/stable-dreamfusion | - 文本<br>- 图片 | NeRF, Mesh (OBJ, PLY) | 数分钟至数十分钟 | - GPU (CUDA)<br>- PyTorch | - 基于 Stable Diffusion 的 text-to-3D<br>- 潜在扩散模型<br>- 支持 NeRF 和 Mesh 输出<br>- 研究导向 |
| **MIDI-3D** | https://github.com/VAST-AI-Research/MIDI-3D | 单张图片 | 组合式 3D 场景 | 数分钟 | - GPU | - CVPR 2025 论文<br>- 单图像到组合 3D 场景生成<br>- 不依赖重建或检索 |
| **Customize-It-3D** | https://github.com/nnanhuang/Customize-It-3D | 参考图片 | 3D 模型 | 数分钟 | - GPU | - 两阶段框架<br>- 主题特定扩散先验<br>- 高质量 3D 创建 |

---

## 三、价格对比 (每模型成本估算)

| 平台 | 套餐 | 月费 | 月 credits | 每纹理模型 cost | 每模型有效成本 | 100 模型/月 | 500 模型/月 | 1000 模型/月 |
|------|------|------|-----------|----------------|---------------|------------|------------|-------------|
| **Sloyd** | Plus | $15 | 无限 | N/A | ~$0.015* | $15 | $15 | $15 |
| **Meshy** | Pro | $20 | 1,000 | 20 credits | $0.40 | $40 | $200 | $400 |
| **Tripo** | Professional | $15.9 | 3,000 | 40 credits (HD) | $0.212 | $21.20 | $106 | $212 |
| **CSM** | Pro | $20 | - | ~40 credits | ~$0.20-0.40 | - | - | - |
| **Hyper3D** | 按次 | - | - | $0.3/次 | $0.30 | $30 | $150 | $300 |

*注：Sloyd 按 1000 模型/月计算有效成本，实际为固定月费 unlimited

---

## 四、API 集成要点

### Tripo API
```bash
# 基础端点
POST https://api.tripo3d.ai/v2/generation/image-to-3d
Headers: Authorization: Bearer <API_KEY>
```

### Meshy API
```bash
# 基础端点
POST https://api.meshy.ai/openapi/v2/image-to-3d
Headers: Authorization: Bearer <API_KEY>
```

### Luma API
```bash
# 基础端点
POST https://api.lumalabs.ai/dream-machine/v1/generations
Headers: Authorization: Bearer <API_KEY>
```

### Hyper3D Rodin API
```bash
# 基础端点
POST https://api.hyper3d.com/api/v2/rodin
Headers: Authorization: Bearer <RODIN_API_KEY>
```

### CSM API
```bash
# v3 API (迁移中)
POST https://api.csm.ai/v3/generation
Headers: Authorization: Bearer <API_KEY>
```

---

## 五、推荐建议

### 按使用场景

| 场景 | 推荐服务 | 理由 |
|------|---------|------|
| **快速原型/测试** | TripoSR (开源) | 免费、本地运行、<0.5 秒生成 |
| **游戏开发 (大量资产)** | Sloyd | unlimited 生成，成本最低 |
| **高质量角色模型** | CSM / Meshy | 细节优秀，支持动画 |
| **3D 打印** | Tripo / Meshy | 支持 3MF/OBJ，拓扑优化 |
| **视频 +3D 组合** | Luma AI | Dream Machine 视频生成领先 |
| **企业级/生产环境** | Meshy Enterprise | ISO/SOC2 认证，SLA 保障 |
| **预算有限** | Tripo 免费版 / TripoSR | 300 credits/月或完全免费 |
| **需要 API 集成** | Meshy / Tripo | 文档完善，SDK 支持好 |

### 按预算

- **零预算**: TripoSR (本地运行), Hunyuan3D (本地运行)
- **<$20/月**: Tripo Professional ($15.9), CSM Pro ($20)
- **$20-50/月**: Meshy Pro ($20), Luma Plus ($23.99)
- **>$50/月**: Luma Unlimited ($75.99), 企业定制方案

---

## 六、注意事项

1. **CSM Cube 平台关闭**: CSM 的 Cube 平台将于 2026 年 1 月 5 日关闭，需迁移到新 API
2. **许可证问题**: 免费版 Tripo 生成模型为 CC BY 4.0 (需署名)，商业用途需付费
3. **输出格式兼容性**: 
   - Web/移动: 优先 GLB
   - 游戏引擎: FBX/GLB
   - 3D 打印: OBJ/3MF
   - 动画: FBX
4. **API 速率限制**: 大多数服务 Pro 版 20 RPS，免费版更低
5. **资产保留**: Meshy 等服务商 API 生成资产仅保留 3 天，需及时下载

---

## 七、参考链接汇总

### 官方文档
- Tripo: https://www.tripo3d.ai/api
- Meshy: https://docs.meshy.ai/en/api/
- Luma: https://docs.lumalabs.ai/docs/welcome
- Hyper3D: https://developer.hyper3d.ai/
- CSM: https://docs.csm.ai/

### 开源项目
- TripoSR: https://github.com/VAST-AI-Research/TripoSR
- Hunyuan3D: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- Stable DreamFusion: https://github.com/ashawkey/stable-dreamfusion

### 对比评测
- 3D AI Pricing Comparison: https://www.sloyd.ai/blog/3d-ai-price-comparison
- ToolSchool Tripo Review: https://toolschool.ai/tools/tripo-ai
- ToolSchool CSM Review: https://toolschool.ai/tools/csm-ai

---

*报告生成时间：2026-03-11*
*数据来源：各服务官方文档及第三方评测 (截至 2026 年 3 月)*
