# Bambu Lab (拓竹) 打印机生态系统调研

本文档详细介绍了 Bambu Lab（拓竹）3D 打印机的完整生态系统，包括官方 API、软件、第三方工具、打印机型号、文件格式、功能特性和社区资源。

---

## 目录

1. [官方 API 和 SDK](#1-官方-api-和-sdk)
2. [官方软件](#2-官方软件)
3. [第三方工具和库](#3-第三方工具和库)
4. [打印机型号](#4-打印机型号)
5. [文件格式支持](#5-文件格式支持)
6. [功能特性](#6-功能特性)
7. [社区资源](#7-社区资源)

---

## 1. 官方 API 和 SDK

### 1.1 Bambu Lab Cloud API

Bambu Lab 提供基于云的 API，允许开发者与打印机进行远程通信和控制。

**主要特点：**
- 基于网络流量分析文档化的 API 端点
- 支持云模式和本地连接
- 提供完整的 Python 客户端库
- 支持双因素认证（2FA）

**认证方式：**
1. 通过 Bambu Lab 账户登录
2. 需要邮箱验证码进行 2FA 认证
3. 获取访问令牌（Access Token）
4. 令牌保存在 `~/.bambu_token` 供后续使用

**API 端点分类：**
- **设备管理**：列出设备、获取设备信息、固件版本
- **用户档案**：账户信息、拥有的打印机型号
- **AMS/耗材**：AMS 单元的耗材数据
- **摄像头凭证**：用于 P2P 视频流的 TTCode（TUTK 协议）
- **文件上传**：通过 S3 签名 URL 上传云文件
- **文件管理**：列出和管理云文件

**参考实现：**
- [Bambu-Lab-Cloud-API (GitHub)](https://github.com/coelacant1/Bambu-Lab-Cloud-API) - 基于网络流量分析的完整 Python 实现
- PyPI 包：`bambu-lab-cloud-api`

### 1.2 本地局域网 API (LAN API)

Bambu Lab 打印机支持本地网络通信，主要通过 MQTT 协议实现。

**连接模式：**

| 模式 | 描述 | 认证要求 |
|------|------|----------|
| **云模式** | 通过 Bambu Cloud 连接 | 需要 Bambu 账户登录 |
| **普通 LAN 模式** | 本地网络直接连接 | 部分命令需要授权验证 |
| **开发者模式 (Developer Mode)** | 完全本地控制 | 无需授权验证，但无法连接云 |

**开发者模式说明：**
- 2025 年新增功能，响应社区反馈
- 在 LAN 模式下运行
- 第三方软件无需修改即可工作
- **重要限制**：启用后无法连接 Bambu Cloud
- 适用于高级用户，完全控制打印机功能和安全

**MQTT 协议：**
- 实时打印机监控和控制
- 订阅打印机状态更新
- 支持发送控制命令
- 端口：8883（SSL）

**本地 FTP 服务器：**
- 用于上传切片文件（3MF/G-code）
- 需要访问码（Access Code）认证
- 访问码在打印机屏幕上显示

**Bambu Local Server（企业级）：**
- 部署在本地环境的 HTTP 服务器
- 提供 24/7 连接和控制
- 支持与企业 ERP/MES 系统集成
- 需要申请 SDK 访问权限

**Local Server API 功能：**
- **打印机管理 API**：发现、添加、移除打印机
- **状态监控 API**：打印状态、HMS 警报、错误通知、摄像头快照
- **打印机控制 API**：暂停/恢复打印、调整速度、耗材回缩
- **文件管理 API**：上传 3MF 文件、存储和删除
- **打印任务 API**：启动单/多机打印任务、AMS 集成

### 1.3 官方 SDK 和客户端库

#### Python 库

| 库名称 | 描述 | 链接 |
|--------|------|------|
| **bambu-lab-cloud-api** | 完整的 Cloud API 客户端，支持 MQTT、视频流、代理服务器 | [GitHub](https://github.com/coelacant1/Bambu-Lab-Cloud-API) / [PyPI](https://pypi.org/project/bambu-lab-cloud-api/) |
| **bambulabs-api** | 与 BambuLab 3D 打印机交互的 Python API | [PyPI](https://pypi.org/project/bambulabs-api/) |
| **pybambu** | 订阅 MQTT 服务器的 Python 库（X1C） | [GitHub](https://github.com/greghesp/pybambu) |
| **bambu-printer-manager** | 纯 Python 库，用于管理 Bambu Lab 打印机 | [GitHub](https://github.com/synman/bambu-printer-manager) |

#### Node.js 库

| 库名称 | 描述 | 链接 |
|--------|------|------|
| **bambu-node** | 通过 MQTT 连接和接收数据的 Node.js 库 | [GitHub](https://github.com/THE-SIMPLE-MARK/bambu-node) |
| **bambu-js** | npm 包，版本 3.0.1，与 Bambu 打印机交互的工具 | [npm](https://www.npmjs.com/package/bambu-js) |
| **bambu-link** | 通过 MQTT 与 Bambu Lab 3D 打印机通信的 Node.js 模块 | [GitHub](https://github.com/Evan-2007/bambu-link) |
| **n8n-nodes-bambulab** | n8n 工作流自动化社区节点 | [npm](https://libraries.io/npm/n8n-nodes-bambulab) |

### 1.4 API 认证方式详解

**云模式认证流程：**
1. 用户通过 Bambu Studio 或 Bambu Handy 登录 Bambu Lab 账户
2. 系统发送邮箱验证码（2FA）
3. 输入验证码后获取访问令牌
4. 令牌用于后续 API 调用（自动刷新）

**本地模式认证：**
1. 在打印机屏幕上获取访问码（Access Code）
2. 通过 Bambu Handy App 扫描二维码连接
3. 在 Bambu Studio 中使用相同的访问码登录
4. 访问码用于 MQTT 连接和 FTP 上传

**开发者模式：**
- 无需授权验证
- 直接通过本地网络访问
- 保留旧版固件的所有功能
- 适合需要完全控制的高级用户

---

## 2. 官方软件

### 2.1 Bambu Studio（切片软件）

**概述：**
Bambu Studio 是一款开源、功能丰富的切片软件，专为 Bambu Lab 打印机设计。基于 PrusaSlicer 开发，针对 Bambu 打印机进行了优化。

**主要功能：**
- **项目化工作流**：系统化的切片算法优化
- **多色打印支持**：完美支持 AMS 多耗材系统
- **远程打印**：支持通过网络（WAN/LAN）远程控制打印机
- **丰富的预设**：内置多种耗材和打印机配置文件
- **支撑结构优化**：智能支撑生成和树状支撑
- **自适应分层**：根据模型几何形状自动调整层厚

**技术特性：**
- **开源许可**：GNU Affero General Public License v3.0
- **GitHub 仓库**：[bambulab/BambuStudio](https://github.com/bambulab/BambuStudio)
- **跨平台支持**：Windows、macOS、Linux
- **网络插件**：用于第三方集成的网络通信模块

**版本更新：**
- 最新版本：2.1.0（2025 年）
- 新增功能：调整内外墙间隙，提高尺寸精度和层间一致性

**衍生版本：**
- **Orca Slicer**：Bambu Studio 的开源分支，支持更多打印机品牌
  - GitHub: [OrcaSlicer/OrcaSlicer](https://github.com/OrcaSlicer/OrcaSlicer)
  - 许可：AGPL v3.0
  - 额外功能：更多打印机支持、高级功能

**下载：**
- 官网：[bambulab.com/en/download/studio](https://bambulab.com/en/download/studio)

### 2.2 Bambu Handy（手机 App）

**概述：**
Bambu Handy 是专为 Bambu Lab 3D 打印机设计的一站式移动服务平台，支持 iOS 和 Android。

**主要功能：**
- **远程控制**：随时随地控制打印机
- **MakerWorld 集成**：浏览和打印海量免费 3D 模型
- **实时预览**：查看打印进度和摄像头画面
- **多色打印**：支持 AMS 多耗材打印任务
- **错误纠正**：接收打印机错误通知并处理
- **一键打印**：从 MakerWorld 直接打印模型

**平台支持：**
- **iOS**：App Store 提供，支持 iOS Home Screen 小组件
- **Android**：Google Play 提供
- **最新版本**：v2.19.0+（支持 iOS Live Activities）

**特色功能：**
- **实时活动（iOS）**：在锁屏界面显示打印进度
- **后台刷新**：持续监控打印状态
- **多打印机管理**：同时管理多台 Bambu 打印机

**下载：**
- [iOS App Store](https://apps.apple.com/us/app/bambu-handy/id1625671285)
- [Google Play](https://play.google.com/store/apps/details?id=bbl.intl.bambulab.com)

### 2.3 Bambu Cloud 服务

**概述：**
Bambu Cloud 是 Bambu Lab 提供的云端服务，支持远程打印、文件存储和设备管理。

**核心服务：**
- **远程打印**：通过云端发送打印任务到打印机
- **文件存储**：云存储切片文件和 3D 模型
- **设备绑定**：将打印机绑定到用户账户
- **固件更新**：OTA（空中下载）固件升级
- **视频流**：通过云端访问打印机摄像头（需授权）

**服务限制：**
- 开发者模式下无法连接 Bambu Cloud
- 部分功能需要订阅或付费
- 受 Bambu Lab 服务条款约束

**系统状态：**
- 状态页面：[status.bambulab.com](https://status.bambulab.com/)

### 2.4 Bambu Connect（中间件）

**概述：**
Bambu Connect 是 Bambu Lab 推出的用户友好型中间件工具，用于第三方软件与打印机的安全集成。

**核心功能：**
- **云账户登录**：登录 Bambu Lab 云账户
- **打印机管理**：查看和管理绑定的打印机
- **连接性**：发现和连接 LAN 模式打印机
- **文件导入和打印**：导入 G-code/3MF 文件并发送打印
- **基本控制**：控制打印机轴移动等基本功能

**平台支持：**
- **Windows**：Windows 10 或更高版本（x86_64）
- **macOS**：macOS 13 或更高版本（arm64 & x86_64）
- **Linux**：开发中

**集成方式：**
- **URL Scheme**：第三方应用可通过 `bambu-connect://import-file` 调用
- **网络插件**：第三方切片软件可集成网络插件

**示例 URL：**
```
bambu-connect://import-file?path=%2Ftmp%2Fcube.gcode.3mf&name=Cube&version=1.0.0
```

---

## 3. 第三方工具和库

### 3.1 GitHub 开源项目

| 项目名称 | 描述 | 链接 |
|----------|------|------|
| **Bambu-Lab-Cloud-API** | 完整的 Cloud API Python 实现和文档 | [GitHub](https://github.com/coelacant1/Bambu-Lab-Cloud-API) |
| **pybambu** | Python MQTT 客户端库 | [GitHub](https://github.com/greghesp/pybambu) |
| **bambu-printer-manager** | 纯 Python 打印机管理库 | [GitHub](https://github.com/synman/bambu-printer-manager) |
| **BambUI** | LAN 模式的轻量级 UI | [GitHub](https://github.com/fidoriel/BambUI) |
| **bambu-node** | Node.js MQTT 客户端 | [GitHub](https://github.com/THE-SIMPLE-MARK/bambu-node) |
| **bambu-link** | Node.js MQTT 通信模块 | [GitHub](https://github.com/Evan-2007/bambu-link) |
| **ha-bambulab** | Home Assistant 自定义组件 | [GitHub](https://github.com/greghesp/ha-bambulab) |

### 3.2 Python 客户端库

**bambu-lab-cloud-api**
```python
from bambulab import BambuAuthenticator, BambuClient, MQTTClient

# 认证（支持 2FA）
auth = BambuAuthenticator()
token = auth.login("your-email@example.com", "your-password")

# 云 API 客户端
client = BambuClient(token=token)
devices = client.get_devices()

# MQTT 监控
mqtt = MQTTClient(uid="uid", token=token, device_serial="serial")
mqtt.connect(blocking=True)

# 本地 FTP 上传
from bambulab import LocalFTPClient
ftp = LocalFTPClient("192.168.1.100", "access_code")
ftp.connect()
ftp.upload_file("model.3mf")
```

**安装：**
```bash
pip install bambu-lab-cloud-api
pip install pybambu
pip install bambulabs-api
```

### 3.3 Node.js 客户端库

**bambu-node**
```javascript
const { BambuClient } = require('bambu-node');

const client = new BambuClient({
  host: '192.168.1.100',
  accessCode: 'YOUR_ACCESS_CODE',
  serial: 'YOUR_SERIAL'
});

client.on('printer:dataUpdate', (data) => {
  console.log('Print progress:', data.print.mc_percent);
});

client.connect();
```

**安装：**
```bash
npm install bambu-node
npm install bambu-js
```

### 3.4 Home Assistant 集成

**官方集成：**
- **组件名称**：ha-bambulab
- **安装方式**：HACS（Home Assistant Community Store）
- **功能**：
  - 实时打印进度监控
  - 温度和风扇状态
  - AMS 耗材状态
  - 摄像头快照
  - 打印控制（暂停、恢复）

**配置示例：**
```yaml
# configuration.yaml
rest:
  - resource: http://localhost:8080/api/v1/status?device_id=YOUR_DEVICE_ID
    scan_interval: 10
    sensor:
      - name: "Bambu Print Progress"
        value_template: "{{ value_json.print.mc_percent }}"
```

**兼容性层：**
- 通过 `servers/compatibility.py` 恢复旧版本地 API
- 无需开发者模式即可使用
- 支持 Home Assistant、OctoPrint 等工具

### 3.5 OctoPrint 插件

**Bambu Lab 插件：**
- **功能**：通过局域网连接 Bambu 打印机
- **连接方式**：模拟 SD 卡打印
- **要求**：
  - 打印机和 OctoPrint 在同一网络
  - 无需有线连接
  - 可选 LAN-only 模式

**设置步骤：**
1. 在 OctoPrint 中安装 Bambu Lab 插件
2. 输入打印机 IP 地址和访问码
3. 插件自动生成文件列表
4. 支持上传和打印 3MF/G-code 文件

**注意事项：**
- 新固件可能需要 Bambu Connect 中间件
- 开发者模式下兼容性最佳
- 部分控制功能可能受限

### 3.6 其他集成

**n8n 工作流自动化：**
- **节点**：n8n-nodes-bambulab
- **功能**：在 n8n 工作流中控制和监控打印机
- **用例**：自动化打印任务、通知、数据记录

**3DPrinterOS：**
- 专业 3D 打印管理平台
- 支持 Bambu 打印机局域网连接
- 云端仪表板远程访问

**Polar Cloud：**
- 官方 Polar Cloud × Bambu 直接连接
- OctoPrint 集成作为备选方案

---

## 4. 打印机型号

### 4.1 产品系列概览

Bambu Lab 目前主要有三个产品系列：

| 系列 | 定位 | 代表型号 |
|------|------|----------|
| **X 系列** | 高端旗舰 | X1, X1C, X1E, H2D, H2C |
| **P 系列** | 中端主力 | P1P, P1S |
| **A 系列** | 入门级 | A1, A1 mini |

### 4.2 各型号详细规格

#### X 系列（高端旗舰）

**Bambu Lab X1 Carbon (X1C)**
- **状态**：2025 年已停产
- **构建体积**：256×256×256 mm³
- **最高速度**：500 mm/s
- **特点**：
  - AI 检测（激光雷达）
  - 多摄像头系统（喷嘴摄像头、工具头摄像头）
  - 5 英寸触摸屏（720×1280）
  - 封闭腔体
  - 主动气流控制
- **材料**：支持 PLA、PETG、TPU、ABS、ASA、PA、PC、碳纤维增强材料
- **价格**：原价 $1,199

**Bambu Lab X1E（企业版）**
- **定位**：企业级 X1C 变种
- **构建体积**：
  - 单喷嘴：325×320×325 mm³（左）/ 305×320×325 mm³（右）
  - 双喷嘴：300×320×325 mm³
- **特点**：
  - 双喷嘴系统
  - 激光安全窗口（激光版）
  - 增强的安全功能
  - 企业级支持
- **软件支持**：
  - Bugfix 和功能更新保证至：2030 年 11 月 18 日
  - 安全补丁更新保证至：2032 年 11 月 18 日

**Bambu Lab H2D / H2C**
- **最新型号**：2025 年发布
- **构建体积**：
  - 单喷嘴：325×320×320 mm³（左）/ 305×320×325 mm³（右）
  - 双喷嘴：300×320×325 mm³
- **特点**：
  - 双喷嘴打印
  - 激光版配备鸟眼摄像头（3264×2448）
  - 高级空气过滤（G3、H12、活性炭）
  - 闭环控制冷却系统
- **固件版本**：01.03.00.00（H2D）

#### P 系列（中端主力）

**Bambu Lab P1P**
- **构建体积**：256×256×256 mm³
- **最高速度**：500 mm/s
- **特点**：
  - 开放框架设计
  - 支持 AMS
  - 5 英寸触摸屏（854×480）
  - 主动气流控制
- **材料**：支持 PLA、PETG、ABS、ASA、TPU、PA、PC、碳纤维增强材料
- **价格**：约 $599

**Bambu Lab P1S**
- **构建体积**：256×256×256 mm³
- **最高速度**：500 mm/s
- **特点**：
  - 封闭腔体（相比 P1P）
  - 支持 AMS 多材料打印
  - 更好的温度控制
  - 活性炭过滤器
- **材料**：与 P1P 相同，但打印 ABS/ASA 更稳定
- **价格**：约 $699
- **软件支持**：
  - Bugfix 和功能更新保证至：2030 年 10 月 14 日
  - 安全补丁更新保证至：2032 年 10 月 14 日

#### A 系列（入门级）

**Bambu Lab A1**
- **构建体积**：256×256×256 mm³
- **最高速度**：500 mm/s
- **特点**：
  - 快速更换喷嘴系统
  - 支持 AMS lite
  - 自动调平
  - 振动补偿
- **材料**：主要支持 PLA、PETG、TPU
- **价格**：约 $459（Combo 版含 AMS lite）
- **软件支持**：
  - Bugfix 和功能更新保证至：2030 年 3 月 25 日
  - 安全补丁更新保证至：2032 年 3 月 25 日

**Bambu Lab A1 mini**
- **构建体积**：180×180×180 mm³
- **最高速度**：500 mm/s
- **特点**：
  - 紧凑设计
  - 经济实惠
  - 自动调平
  - 支持 AMS lite
- **材料**：PLA、PETG、TPU
- **价格**：约 $299（Combo 版含 AMS lite）
- **适用场景**：小型打印、教育、初学者

### 4.3 型号功能差异对比

| 功能 | X1C/X1E | P1S | P1P | A1 | A1 mini |
|------|---------|-----|-----|----|---------|
| **构建体积** | 256³ / 325³ | 256³ | 256³ | 256³ | 180³ |
| **封闭腔体** | ✓ | ✓ | ✗ | ✗ | ✗ |
| **AI 检测** | ✓ | ✗ | ✗ | ✗ | ✗ |
| **多摄像头** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **AMS 支持** | ✓ | ✓ | ✓ | ✓ (lite) | ✓ (lite) |
| **触摸屏** | 5" 720p | 5" 480p | 5" 480p | 5" 480p | 无 |
| **最高温度** | 120°C | 110°C | 110°C | 110°C | 100°C |
| **碳纤维材料** | ✓ | ✓ | ✓ | △ | △ |
| **价格区间** | $1,200+ | $699 | $599 | $459 | $299 |

**符号说明**：✓ = 支持，✗ = 不支持，△ = 有限支持

### 4.4 选购建议

**专业用户/企业**：
- 推荐：X1E 或 H2 系列
- 理由：双喷嘴、大尺寸、企业支持、长期软件更新

**高级爱好者**：
- 推荐：P1S Combo 或 X1C（二手）
- 理由：封闭腔体、AMS 多色打印、良好性价比

**入门用户**：
- 推荐：A1 Combo 或 A1 mini
- 理由：价格实惠、易于使用、基本功能齐全

**教育/小型打印**：
- 推荐：A1 mini
- 理由：紧凑、安全、经济

---

## 5. 文件格式支持

### 5.1 支持的文件格式

| 格式 | 描述 | 用途 | 支持程度 |
|------|------|------|----------|
| **3MF** | 3D Manufacturing Format | 首选格式，包含模型、切片设置、G-code | ★★★★★ |
| **STL** | Stereolithography | 标准 3D 模型格式，需切片 | ★★★★☆ |
| **G-code** | 数控代码 | 打印指令，通常封装在 3MF 中 | ★★★★☆ |
| **OBJ** | Wavefront Object | 3D 模型格式，需转换 | ★★★☆☆ |
| **STEP/STP** | CAD 交换格式 | 工程模型，需转换 | ★★★☆☆ |
| **AMF** | Additive Manufacturing File | 3MF 前身，较少使用 | ★★☆☆☆ |

### 5.2 3MF 格式详解

**什么是 3MF：**
3MF（3D Manufacturing Format）是 Bambu Lab 的首选文件格式，由微软等公司开发的现代 3D 打印格式。

**3MF 文件结构：**
```
cube.gcode.3mf (实际是 ZIP 压缩包)
├── 3D/
│   └── model.rel (3D 模型数据)
├── Metadata/
│   └── slice_info.config (切片配置)
├── G-code/
│   └── *.gcode (实际打印指令)
└── thumbnails/
    └── *.png (预览图)
```

**3MF 优势：**
- **一体化**：模型、切片设置、G-code 打包在一起
- **元数据**：包含耗材信息、打印时间估计、预览图
- **可压缩**：本质是 ZIP 格式，可重命名为 .zip 解压查看内容
- **多模型**：支持在一个文件中包含多个打印模型
- **颜色信息**：支持多色打印的颜色数据

**提取 G-code：**
```bash
# 将 3MF 重命名为 ZIP 并解压
mv model.gcode.3mf model.zip
unzip model.zip
# G-code 文件在 G-code/ 目录中
```

### 5.3 STL 格式处理

**STL 特点：**
- 仅包含 3D 模型几何信息（三角网格）
- 不包含颜色、材质、切片设置
- 需要切片软件处理生成 G-code

**工作流程：**
1. 导入 STL 到 Bambu Studio
2. 调整模型位置、方向、缩放
3. 选择耗材和打印设置
4. 切片生成 3MF/G-code
5. 发送到打印机

### 5.4 G-code 格式

**Bambu Lab G-code 特点：**
- 标准 G-code 命令加上 Bambu 特定扩展
- 包含温度控制、风扇速度、AMS 切换等指令
- 通常封装在 3MF 文件中
- 可直接通过 FTP 上传到打印机

**常见命令：**
```gcode
M104 S200 ; 设置喷嘴温度
M140 S60  ; 设置热床温度
M106 S255 ; 设置风扇速度
M600      ; 换料命令（AMS）
G1 X100 Y100 F3000 ; 移动到指定位置
```

### 5.5 格式转换

**STL 转 3MF：**
1. 在 Bambu Studio 中导入 STL
2. 进行切片设置
3. 保存项目为 3MF 格式

**G-code 转 3MF：**
1. 在切片软件中导入原始 STL/OBJ
2. 使用相同设置重新切片
3. 导出为 3MF

**3MF 转 STL：**
1. 解压 3MF 文件（重命名为 .zip）
2. 提取 3D/model 文件
3. 使用 CAD 软件转换为 STL

---

## 6. 功能特性

### 6.1 远程打印

**云打印：**
- 通过 Bambu Cloud 远程发送打印任务
- 支持从 MakerWorld 直接打印
- 需要打印机绑定到 Bambu 账户
- 可通过 Bambu Handy App 或 Bambu Studio 操作

**局域网打印：**
- 本地网络直接发送文件
- 通过 FTP 上传 3MF/G-code 文件
- 需要访问码认证
- 支持 Bambu Connect 中间件

**远程打印流程：**
```
1. 切片模型（Bambu Studio / Orca Slicer）
   ↓
2. 保存为 3MF 文件
   ↓
3. 选择打印方式：
   - 云打印：上传到 Bambu Cloud → 推送到打印机
   - 本地打印：通过 Bambu Connect 或 FTP 直接发送
   ↓
4. 打印机接收并开始打印
```

**第三方集成：**
- 通过 URL Scheme 调用 Bambu Connect：
  ```
  bambu-connect://import-file?path=...&name=...&version=1.0.0
  ```
- 使用 API 直接上传（需要认证）

### 6.2 打印监控（摄像头）

**摄像头系统：**

| 型号 | 摄像头类型 | 分辨率 | 功能 |
|------|-----------|--------|------|
| **X1C/X1E** | 喷嘴摄像头 + 工具头摄像头 | 1920×1080 | 实时预览、延时摄影、AI 检测 |
| **P1S/P1P** | 腔体摄像头 | 1920×1080 | 实时预览、延时摄影 |
| **A1/A1 mini** | 腔体摄像头 | 1920×1080 | 实时预览、延时摄影 |
| **H2D/H2C** | 多摄像头系统 | 最高 3264×2448 | 鸟眼视图、实时预览 |

**视频流协议：**
- **X1 系列**：RTSP 流（实时流协议）
- **P1/A1 系列**：JPEG 帧流（逐帧传输）
- **TUTK 协议**：P2P 视频传输（需要 TTCode 认证）

**监控功能：**
- **实时预览**：通过 App 或网页查看打印进度
- **延时摄影**：自动生成打印过程延时视频
- **AI 故障检测**：X1 系列支持 spaghetti 检测（打印失败识别）
- **快照**：定时拍摄打印进度照片

**第三方视频流：**
- 使用 `bambu-lab-cloud-api` 获取视频流凭证
- 通过 VLC、ffmpeg 播放 RTSP 流
- JPEG 帧流可通过 Python 库获取

**示例代码：**
```python
from bambulab import JPEGFrameStream, RTSPStream

# P1/A1 系列（JPEG 帧）
with JPEGFrameStream("192.168.1.100", "access_code") as stream:
    frame = stream.get_frame()
    with open('snapshot.jpg', 'wb') as f:
        f.write(frame)

# X1 系列（RTSP）
stream = RTSPStream("192.168.1.100", "access_code")
url = stream.get_stream_url()
# 使用 VLC 或 ffmpeg 播放
```

### 6.3 耗材管理（AMS）

**AMS（Automatic Material System）：**

AMS 是 Bambu Lab 的自动耗材管理系统，支持多色和多材料打印。

**AMS 型号：**
- **AMS（标准版）**：4 耗材位，支持 X1/P1 系列
- **AMS lite**：4 耗材位，支持 A1 系列，开放式设计
- **AMS 2 Pro**：升级版，改进耗材切换和张力控制

**核心功能：**
- **自动换料**：打印过程中自动切换耗材
- **RFID 识别**：自动识别 Bambu Lab 官方耗材类型和颜色
- **耗材张力控制**：主动控制耗材输送张力
- **耗材余量检测**：估算耗材剩余量
- **干燥盒功能**：AMS 为密封设计，可放置干燥剂

**多色打印：**
- 单 AMS：最多 4 色
- 多 AMS 串联：最多 16 色（4 个 AMS）
- 支持颜色混合和渐变效果

**耗材兼容性：**
- **官方耗材**：完美支持（RFID 自动识别）
- **第三方耗材**：支持，但需手动输入参数
- **特殊材料**：支持 PLA、PETG、TPU、ABS、ASA、PA、PC、碳纤维增强材料

**AMS 操作：**
1. 装入耗材卷到 AMS 槽位
2. 打印机自动读取 RFID（官方耗材）
3. 在 Bambu Studio 中设置耗材映射
4. 切片时选择多色打印
5. 打印机自动切换耗材

**注意事项：**
- 换料会产生废料（purge）
- 多色打印时间较长
- 需要定期清理废料盒

### 6.4 打印队列

**云打印队列：**
- 通过 Bambu Cloud 管理打印任务
- 支持多台打印机任务分配
- 可查看历史打印记录

**本地打印队列：**
- 打印机内置存储（8GB eMMC）
- 支持 USB 存储设备
- 可通过 FTP 管理文件

**队列管理功能：**
- 查看待打印文件列表
- 删除不需要的文件
- 重新打印历史任务
- 暂停/恢复打印任务

**API 支持：**
```python
# 获取打印队列
files = client.get_files()

# 上传文件
result = client.upload_file("model.3mf")

# 启动打印
client.print_file(device_id, file_id)
```

### 6.5 固件更新

**更新方式：**

| 方式 | 描述 | 适用场景 |
|------|------|----------|
| **OTA（空中下载）** | 通过 Wi-Fi 自动下载更新 | 常规更新，最便捷 |
| **Bambu Handy** | 通过手机 App 管理更新 | 远程更新、版本回退 |
| **Bambu Studio** | 通过 PC 软件推送更新 | 批量更新多台打印机 |
| **MicroSD 卡** | 手动下载固件到 SD 卡 | 离线更新、紧急恢复 |

**OTA 更新流程：**
1. 打印机连接 Wi-Fi 并绑定账户
2. 检测到新固件时弹出提示
3. 用户确认更新
4. 自动下载并安装（约 5-10 分钟）
5. 打印机重启完成更新

**MicroSD 卡更新步骤：**
1. 从官网下载固件文件（.bin）
2. 将文件复制到 MicroSD 卡根目录
3. 插入打印机 SD 卡槽
4. 在打印机菜单选择"更新固件"
5. 等待更新完成

**版本管理：**
- 可查看当前固件版本
- Bambu Handy 支持回退到之前的版本（有限制）
- 更新日志在官网和论坛发布

**最新固件版本（2025 年）：**
- X1 系列：01.09.00.00
- P1 系列：01.08.02.00
- A1 系列：01.08.00.00
- H2 系列：01.03.00.00

**注意事项：**
- 更新前确保打印机空闲
- 保持电源稳定，避免断电
- 开发者模式下 OTA 可能受限
- 第三方软件可能需要更新网络插件

---

## 7. 社区资源

### 7.1 官方资源

**官方网站：**
- 官网：[bambulab.com](https://bambulab.com/)
- 美国官网：[bambulab.com/en-us](https://bambulab.com/en-us)
- 在线商店：[store.bambulab.com](https://store.bambulab.com/)

**官方 Wiki：**
- 地址：[wiki.bambulab.com](https://wiki.bambulab.com/en/home)
- 内容：
  - 打印机使用手册
  - 软件教程（Bambu Studio、Bambu Handy）
  - 故障排除指南
  - 第三方集成文档
  - 固件更新指南

**官方博客：**
- 地址：[blog.bambulab.com](https://blog.bambulab.com/)
- 内容：产品发布、功能更新、用户故事

**支持中心：**
- 技术支持：[bambulab.com/en/support](https://bambulab.com/en/support)
- 提交工单：[bambulab.com/en/my/support/tickets](https://bambulab.com/en/my/support/tickets)
- Bambu Lab Academy：培训和学习资源

### 7.2 官方论坛

**Bambu Lab Community Forum：**
- 地址：[forum.bambulab.com](https://forum.bambulab.com/)
- 主要板块：
  - Bambu Lab X1 系列
  - Bambu Lab P1 系列
  - Bambu Lab A1 系列
  - Bambu Firmware（固件讨论）
  - Bambu Studio（切片软件）
  - General Discussions（综合讨论）
  - Site Feedback（网站反馈）

**论坛特点：**
- 官方人员参与回复
- 活跃的用户社区
- 丰富的故障排除案例
- 新功能讨论和反馈

**注意事项：**
- 新账户初期发帖可能受限
- 需遵守社区准则
- 禁止品牌攻击和不当内容

### 7.3 Discord 社区

**官方 Discord：**
- 邀请链接：[discord.com/invite/bambulab](https://discord.com/invite/bambulab)
- 特点：
  - 官方运营的 Discord 服务器
  - 实时聊天和支持
  - 多个频道（按打印机型号、主题分类）
  - 官方公告和更新

**非官方 Discord：**
- **Bambu Lab Uncensored**：用户自发创建的无审查 Discord
  - 更自由的讨论环境
  - 500+ 成员（持续增长）
  - 适合讨论敏感话题

**Discord vs 论坛：**
- Discord：实时聊天、快速响应、适合即时问题
- 论坛：结构化讨论、易于搜索、适合深度技术话题

### 7.4 Reddit 社区

**r/BambuLab：**
- 地址：[reddit.com/r/BambuLab](https://www.reddit.com/r/BambuLab/)
- 订阅数：234,000+（2025 年）
- 内容：
  - 打印作品展示
  - 问题求助和解答
  - 固件更新讨论
  - 第三方工具分享
  - 耗材评测

**r/BambuLab_Community：**
- 地址：[reddit.com/r/BambuLab_Community](https://www.reddit.com/r/BambuLab_Community/)
- 特点：社区运营的 subreddit
- 更宽松的讨论环境

**社区规则：**
- 禁止品牌攻击
- 禁止不当内容（色情、武器、毒品相关）
- 要求信息准确
- 鼓励互助和支持

### 7.5 其他社区平台

**Facebook 群组：**
- **Bambu Lab Official Users**：[facebook.com/groups/bambulabofficialusers](https://www.facebook.com/groups/bambulabofficialusers/)
- **Bambu Lab Beginners and Experts**：新手和专家交流平台

**MakerWorld：**
- 地址：[makerworld.com](https://makerworld.com/)
- Bambu Lab 官方的 3D 模型分享平台
- 与 Bambu Handy 深度集成
- 一键打印功能

**YouTube 频道：**
- **Bambu Lab 官方频道**：[youtube.com/@bambulab](https://www.youtube.com/@bambulab)
- **第三方创作者**：大量教程、评测、打印技巧视频

### 7.6 第三方教程和资源

**视频教程：**
- "Beginner Bambu Lab Studio Slicer Software Basics Tutorial" - 新手切片教程
- "Bambu Studio Beginner Guide (2025)" - 2025 年设置指南
- "Bambu Lab 3D Printer Comparison Deep Dive" - 型号对比
- "How to Enable LAN-Only Mode" - LAN 模式设置

**文档和指南：**
- **3DPrinterOS 集成指南**：专业打印管理
- **Home Assistant 集成教程**：[cytron.io/tutorial/add-bambu-lab-3d-printer-to-your-home-assistant](https://www.cytron.io/tutorial/add-bambu-lab-3d-printer-to-your-home-assistant)
- **OctoPrint 设置指南**：社区论坛和 YouTube

**GitHub 项目文档：**
- Bambu-Lab-Cloud-API：完整的 API 文档
- ha-bambulab：Home Assistant 组件文档
- bambu-node：Node.js 库 API 参考

### 7.7 社区贡献

**开源贡献：**
- Bambu Studio 源代码：[github.com/bambulab/BambuStudio](https://github.com/bambulab/BambuStudio)
- Orca Slicer：[github.com/OrcaSlicer/OrcaSlicer](https://github.com/OrcaSlicer/OrcaSlicer)
- 第三方库和工具：欢迎 Pull Request

**知识分享：**
- 论坛教程和指南
- Reddit 经验分享
- YouTube 视频教程
- Discord 实时帮助

**反馈渠道：**
- 官方论坛功能请求板块
- GitHub Issues（开源项目）
- Discord 反馈频道
- 官方支持工单

---

## 附录

### A. 快速参考链接

| 类型 | 名称 | 链接 |
|------|------|------|
| **官网** | Bambu Lab | https://bambulab.com/ |
| **商店** | Bambu Store | https://store.bambulab.com/ |
| **Wiki** | Official Wiki | https://wiki.bambulab.com/ |
| **论坛** | Community Forum | https://forum.bambulab.com/ |
| **Discord** | Official Discord | https://discord.com/invite/bambulab |
| **Reddit** | r/BambuLab | https://reddit.com/r/BambuLab |
| **GitHub** | Bambu Lab Org | https://github.com/bambulab |
| **模型** | MakerWorld | https://makerworld.com/ |
| **状态** | System Status | https://status.bambulab.com/ |

### B. API 库快速安装

**Python：**
```bash
pip install bambu-lab-cloud-api
pip install pybambu
pip install bambulabs-api
```

**Node.js：**
```bash
npm install bambu-node
npm install bambu-js
```

**Home Assistant：**
- 通过 HACS 安装 "Bambu Lab" 集成
- 或使用自定义组件：[ha-bambulab](https://github.com/greghesp/ha-bambulab)

### C. 常见问题（FAQ）

**Q: 如何获取访问码（Access Code）？**
A: 在打印机屏幕上：设置 → 关于 → 访问码。或通过 Bambu Handy App 扫描二维码连接后查看。

**Q: 开发者模式和普通 LAN 模式有什么区别？**
A: 开发者模式无需授权验证，第三方软件可直接使用，但无法连接 Bambu Cloud。普通 LAN 模式部分命令需要授权。

**Q: 如何在 Home Assistant 中集成 Bambu 打印机？**
A: 安装 ha-bambulab 自定义组件（通过 HACS），配置打印机 IP、序列号和访问码。

**Q: 3MF 文件如何提取 G-code？**
A: 将 .gcode.3mf 文件重命名为 .zip，解压后在 G-code/ 目录中找到 G-code 文件。

**Q: AMS 支持哪些耗材？**
A: 官方耗材（带 RFID）完美支持。第三方耗材也可使用，但需手动输入参数。支持 PLA、PETG、TPU、ABS、ASA、PA、PC 等。

**Q: 固件更新失败怎么办？**
A: 尝试 MicroSD 卡手动更新。下载固件 .bin 文件到 SD 卡根目录，插入打印机后选择"更新固件"。

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-03-11 | 1.0 | 初始版本，完整生态系统调研 |

---

**文档说明：**
本文档基于 2025-2026 年的公开信息和社区资源整理。Bambu Lab 的产品和 API 可能随时更新，请以官方最新文档为准。

**免责声明：**
本文档与 Bambu Lab 官方无关联，部分信息基于社区逆向工程和分析。使用第三方工具和 API 时请遵守 Bambu Lab 服务条款，自行承担风险。
