# BrickLink 积木生态系统完整指南

> 最后更新：2026 年 3 月 11 日  
> 本文档详细介绍了 BrickLink（布鲁克）积木生态系统的各个方面，包括平台、工具、文件格式、API 和社区资源。

---

## 目录

1. [BrickLink 平台概述](#1-bricklink-平台概述)
2. [BrickLink Studio 软件](#2-bricklink-studio-软件)
3. [文件格式详解](#3-文件格式详解)
4. [零件系统](#4-零件系统)
5. [API 和数据访问](#5-api-和数据访问)
6. [第三方工具和库](#6-第三方工具和库)
7. [社区资源](#7-社区资源)
8. [与 3D 打印的结合](#8-与 3d-打印的结合)

---

## 1. BrickLink 平台概述

### 1.1 BrickLink.com 是什么

**BrickLink** 是全球最大的在线 LEGO® 积木零件、人仔和套装交易市场。该平台允许用户购买和销售全新或二手的 LEGO 零件，是 LEGO 爱好者、MOC（My Own Creation）设计师和收藏家的重要资源。

**核心数据**（截至 2026 年 3 月）：
- 注册用户：约 945,960 人
- 目录物品总数：203,461 个
  - 套装（Sets）：21,294 个
  - 零件（Parts）：93,735 个
  - 人仔（Minifigures）：18,632 个
  - 配件（Gear）：22,688 个
  - 书籍（Books）：7,772 个
- 活跃商店：17,947 家
- 库存物品批次：56,948,192 批
- 库存物品总量：1,639,185,157 个零件

### 1.2 与 LEGO 的关系

- **2019 年 11 月**：LEGO 集团正式收购 BrickLink，使其成为 LEGO 集团的全资子公司
- **独立运营**：尽管被 LEGO 收购，BrickLink 仍保持独立运营，继续服务于更广泛的积木爱好者社区
- **官方合作**：BrickLink 与 LEGO 合作推出多个官方项目，包括：
  - **BrickLink Designer Program**：设计师计划，让社区设计的套装有机会成为官方产品
  - **LEGO Ideas 整合**：与 LEGO Ideas 平台协同工作

### 1.3 主要功能

#### 零件市场
- **买卖零件**：用户可以购买或销售单个 LEGO 零件
- **价格指南**：提供历史价格数据和市场趋势分析
- **库存管理**：卖家可以管理库存，买家可以创建想买清单（Wanted List）
- **购物车整合**：支持从多个商店合并购买以优化运费

#### 设计工具
- **BrickLink Studio**：官方 3D 建模软件（详见第 2 节）
- **Studio 画廊**：用户分享 MOC 作品的平台
- **零件清单生成**：自动从设计生成购买清单

#### 其他功能
- **My Collection**：用户个人收藏管理
- **评价系统**：买卖双方互评机制
- **论坛社区**：官方讨论区
- **活动和挑战**：定期举办设计比赛

---

## 2. BrickLink Studio 软件

### 2.1 Studio 2.0 软件介绍

**BrickLink Studio** 是 BrickLink 官方推出的免费 3D 建模软件，专为 LEGO 积木设计。它是 LEGO Digital Designer (LDD) 的精神继承者，提供了更强大的功能和更现代化的界面。

**版本历史**：
- Studio 1.0：初始版本
- Studio 2.0：重大更新，引入全新界面和渲染引擎
- 持续更新：定期添加新功能和零件库更新

### 2.2 功能特性

#### 3D 建模
- **直观界面**：拖放式零件放置
- **多种视图**：3D 视图、2D 视图、爆炸视图
- **捕捉系统**：智能零件对齐和捕捉
- **零件搜索**：内置零件库搜索和过滤
- **颜色选择**：完整的 LEGO 颜色系统支持

#### 渲染功能
- **照片级渲染**：内置高质量渲染引擎
- **多种材质**：支持不同 LEGO 材质效果（光面、哑光、透明等）
- **光照控制**：可调整光源位置和强度
- **背景选择**：多种预设背景和自定义背景
- **参考图像**：支持导入参考图像辅助设计

#### 零件清单（BOM）
- **自动生成**：从设计自动创建零件清单
- **价格估算**：连接 BrickLink 市场获取实时价格
- **导出格式**：支持多种导出格式（XML、CSV、IO）
- **库存对比**：可与个人收藏对比，找出缺少的零件

#### 其他特性
- **我的收藏集成**：基于用户实际拥有的零件进行设计
- **指令书生成**：自动创建拼搭说明书
- **稳定性分析**：检查模型结构稳定性
- **协作功能**：支持模型分享和下载

### 2.3 下载和安装

**下载地址**：https://www.bricklink.com/v3/studio/main.page

**系统要求**：
- **Windows**：Windows 10 或更高版本（64 位）
- **macOS**：macOS 10.14 (Mojave) 或更高版本
- **内存**：至少 4GB RAM（推荐 8GB）
- **存储**：至少 2GB 可用空间
- **显卡**：支持 OpenGL 3.3 的显卡

**安装步骤**：
1. 访问 BrickLink Studio 下载页面
2. 选择对应操作系统的版本
3. 下载安装程序
4. 运行安装程序并按照提示完成安装
5. 首次启动时可选择登录 BrickLink 账户以同步收藏

### 2.4 支持的平台

| 平台 | 支持状态 | 备注 |
|------|---------|------|
| Windows 10/11 | ✅ 完全支持 | 64 位版本 |
| macOS 10.14+ | ✅ 完全支持 | Intel 和 Apple Silicon |
| Linux | ❌ 不支持 | 可通过 Wine 运行 |
| iOS | ❌ 不支持 | 无移动版本 |
| Android | ❌ 不支持 | 无移动版本 |

---

## 3. 文件格式详解

### 3.1 .io 文件格式（Studio 项目文件）

**Studio .io 文件** 是 BrickLink Studio 的原生项目文件格式。

**特点**：
- **基于 XML**：内部使用 XML 结构存储数据
- **完整项目信息**：包含模型几何、零件信息、颜色、视角等
- **版本控制**：支持保存多个版本
- **元数据**：包含作者信息、创建日期、修改历史等

**文件结构**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LDRAW>
  <MODEL>
    <META>...</META>
    <PARTS>
      <PART ref="3001.dat" color="1" matrix="..."/>
      <PART ref="3002.dat" color="5" matrix="..."/>
    </PARTS>
  </MODEL>
</LDRAW>
```

**解析库**：
- 官方未公开完整规范
- 社区有非官方解析工具
- 可导出为标准 LDraw 格式进行互操作

### 3.2 .lxf 格式（LEGO Digital Designer）

**LXF 文件** 是 LEGO Digital Designer (LDD) 的项目文件格式，LDD 已于 2016 年停止开发。

**特点**：
- **XML 基础**：使用 XML 格式存储
- **历史兼容**：Studio 可导入 LXF 文件
- **有限功能**：相比 .io 功能较少
- **只读支持**：LDD 已不再更新

**Studio 兼容性**：
- ✅ 可导入 .lxf 文件
- ❌ 不导出为 .lxf 格式
- 建议迁移到 .io 格式

### 3.3 .ldr 格式（LDRAW）

**LDraw 格式** 是开源的 LEGO CAD 文件格式标准，由 LDraw.org 维护。

#### 文件结构

LDraw 文件是纯文本文件，每行一个命令：

**行类型**：
```
0 - 注释或元命令
1 - 子文件引用（零件放置）
2 - 直线
3 - 三角形
4 - 四边形
5 - 可选直线（条件边）
```

**基本语法**：
```
<类型> [参数...]
```

**示例**：
```ldraw
0 !LEGOYPRIM
0 Name: 3001.dat
0 Author: James Jessiman
0 !LDRAW_ORG "P" Primitive

1 16 0 0 0 1 0 0 0 1 0 0 0 1 3001.dat
```

**元命令（META Commands）**：
```
0 !COLOUR <name> CODE <code> VALUE <rgb> EDGE <edge_rgb>
0 !BFC CERTIFY CCW
0 !TEXMAP ...
0 !CATEGORY <category>
0 !KEYWORDS <keywords>
```

#### 颜色定义

LDraw 使用数字颜色代码：
- `0`：主颜色（跟随父零件）
- `16`：主颜色（LDRAW 标准）
- `1-15`：标准 LEGO 颜色
- `24`：边缘颜色（用于轮廓线）

#### 变换矩阵

零件放置使用 4x4 变换矩阵：
```
1 <color> <x> <y> <z> <m11> <m12> <m13> <m21> <m22> <m23> <m31> <m32> <m33> <filename>
```

### 3.4 文件结构解析

**LDraw 库组织**：
```
ldraw/
├── parts/          # 官方零件库
├── p/              # 原始零件（primitive）
├── 48/             # 高分辨率原始零件
├── s/              # 子零件
├── models/         # 用户模型
└── unofficial/     # 非官方零件
```

### 3.5 官方 API 和解析库

#### 官方支持
- **BrickLink API**：RESTful API（详见第 5 节）
- **Studio SDK**：有限制的 SDK，主要用于插件开发
- **LDraw.org**：提供文件格式规范文档

#### 解析库

**Python**：
- `ldraw`：LDraw 文件解析库
- `ldcad`：LDCad 相关工具
- 社区维护的多个解析器

**Node.js**：
- `bricklink-api`：BrickLink API 封装
- `ldraw-parser`：LDraw 文件解析

**其他语言**：
- `BricklinkSharp`：C# .NET 封装
- `ldraw-rs`：Rust 实现

---

## 4. 零件系统

### 4.1 零件编号规则

**LEGO 零件编号系统**：

**标准零件号**：
- 格式：`XXXXX`（通常 4-6 位数字）
- 示例：`3001`（2x4 砖块）、`3002`（2x3 砖块）
- 历史编号：早期零件使用较短编号

**带变体的零件**：
- 格式：`XXXXXcXX` 或 `XXXXXpxX`
- 示例：`3001c01`（3001 的变体 01）
- `px` 后缀：表示图案（pattern）版本

**新零件编号**：
- 现代零件通常使用 5-6 位编号
- 特殊零件可能有字母前缀

### 4.2 零件分类体系

**BrickLink 分类**：

1. **Parts（零件）**
   - Brick（砖块）
   - Plate（板）
   - Tile（光面板）
   - Slope（斜坡）
   - Cylinder（圆柱）
   - Technic（机械组）
   - 等等...

2. **Sets（套装）**
   - 按主题分类（星球大战、城市、创意等）
   - 按年份分类
   - 按零件数分类

3. **Minifigures（人仔）**
   - 按职业/主题分类
   - 身体部位单独分类

4. **Gear（配件）**
   - 钥匙扣
   - 文具
   - 服装
   - 电子产品

5. **Books（书籍）**
   - 说明书
   - 指南书
   - 漫画书

### 4.3 颜色系统

**LEGO 颜色代码**：

BrickLink 使用数字颜色代码系统，包含 100+ 种颜色：

| 代码 | 颜色名称 | RGB 值 |
|------|---------|--------|
| 1 | Black | #05131D |
| 2 | Dark Gray | #707070 |
| 3 | Light Gray | #A0A5A9 |
| 4 | White | #FFFFFF |
| 5 | Red | #BE100E |
| 6 | Green | #237841 |
| 7 | Dark Blue | #0A3A6A |
| 8 | Blue | #0055BF |
| 9 | Yellow | #F2CD37 |
| 10 | Dark Orange | #E86100 |
| ... | ... | ... |

**特殊颜色类型**：
- **Solid**：纯色
- **Trans**：透明
- **Trans-Neon**：霓虹透明
- **Pearl**：珍珠光泽
- **Metallic**：金属色
- **Glow in Dark**：夜光

### 4.4 特殊零件

#### 星辰版/定制件
- **BrickLink Designer Program** 独占零件
- **限量版颜色**：特殊活动或套装独占
- **印刷件**：特殊图案印刷零件
- **模具变化**：同一零件的不同模具版本

#### 非官方零件
- **第三方兼容零件**：非 LEGO 品牌但兼容的零件
- **定制印刷**：用户自定义图案
- **3D 打印零件**：社区设计的特殊零件

### 4.5 零件数据库规模

**统计数据**：
- **唯一零件类型**：约 93,735 种
- **颜色变体**：每个零件平均 10-20 种颜色
- **总零件条目**：超过 100 万种零件 - 颜色组合
- **新增速度**：每月新增数百个新零件
- **历史零件**：包含从 1949 年至今的零件

**数据库来源**：
- LEGO 官方目录
- 社区提交和验证
- BrickLink 用户贡献

---

## 5. API 和数据访问

### 5.1 BrickLink API 文档

**官方 API**：https://api.bricklink.com/api-docs/index.html

**认证**：
- OAuth 1.0a 认证
- 需要申请 API Key
- 速率限制：根据账户类型不同

**主要端点**：

```
GET /api/catalog/items          # 获取目录物品
GET /api/catalog/items/{itemType}/{itemNo}  # 获取特定物品
GET /api/members/{memberName}/inventory     # 获取成员库存
GET /api/orders               # 获取订单
POST /api/orders              # 创建订单
GET /api/priceguide           # 获取价格指南
```

**响应格式**：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    // 数据内容
  }
}
```

### 5.2 Rebrickable API

**Rebrickable** 是第三方 LEGO 数据库和工具平台，提供强大的 API。

**API 文档**：https://rebrickable.com/api/

**功能**：
- 零件和套装数据库查询
- MOC（自定义设计）搜索
- 零件清单对比
- 价格比较
- 构建可行性分析

**认证**：
- API Key 认证（免费和付费层级）
- 速率限制：免费层 100 次/小时

**示例端点**：
```
GET /api/v3/lego/parts/        # 获取零件列表
GET /api/v3/lego/sets/         # 获取套装列表
GET /api/v3/moc/mocs/          # 获取 MOC 列表
POST /api/v3/tools/check-moc/  # 检查是否能用现有零件构建
```

### 5.3 零件数据下载

**LDraw 零件库**：
- **官方库**：https://library.ldraw.org
- **完整下载**：约 200MB（包含所有零件）
- **更新频率**：每月更新
- **格式**：.ldr 文件

**BrickLink 数据导出**：
- 零件清单导出（XML、CSV）
- 库存导出
- 价格历史导出

**Rebrickable 数据**：
- 零件数据库下载（付费）
- 套装零件清单
- MOC 指令下载

### 5.4 价格信息 API

**BrickLink 价格指南**：
- **历史价格**：过去 6 个月交易数据
- **统计信息**：平均价、最高价、最低价、销量
- **按条件**：全新（New）和二手（Used）分开统计
- **按地区**：不同地区价格可能不同

**API 示例**：
```
GET /api/priceguide/items/{itemType}/{itemNo}
GET /api/priceguide/items/{itemType}/{itemNo}/stats
```

**价格因素**：
- 稀有度
- 颜色
- 新旧程度
- 市场需求
- 季节因素

---

## 6. 第三方工具和库

### 6.1 GitHub 上的开源项目

#### 热门项目

**brickstore** (rgriebl/brickstore)
- ⭐ 157 stars
- 功能：BrickLink 库存管理工具
- 语言：C++
- 特点：离线库存管理、批量上传、价格计算

**BricklinkSharp** (gebirgslok/BricklinkSharp)
- ⭐ 33 stars
- 功能：BrickLink API 的 C# 封装
- 语言：C#
- 特点：完整的 API 覆盖、异步支持

**bricklink-api** (ryansh100/bricklink-api)
- ⭐ 13 stars
- 功能：Node.js BrickLink API 客户端
- 语言：JavaScript/TypeScript
- 特点：Promise 支持、类型安全

**brickmos** (merschformann/brickmos)
- ⭐ 10 stars
- 功能：LEGO 马赛克生成器
- 语言：Python
- 特点：图像转 LEGO 马赛克、零件清单生成

### 6.2 Python/Node.js 解析库

#### Python 库

**ldraw**：
```python
from ldraw import LDrawModel

model = LDrawModel.load('model.ldr')
for part in model.parts:
    print(f"{part.name}: {part.color}")
```

**bricklink**：
```python
from bricklink import Client

client = Client(api_key='your_key')
inventory = client.get_inventory('username')
```

#### Node.js 库

**bricklink-api**：
```javascript
const BrickLink = require('bricklink-api');
const client = new BrickLink({ apiKey: 'your_key' });

const items = await client.getCatalogItems();
```

**ldraw-parser**：
```javascript
const LDrawParser = require('ldraw-parser');
const model = LDrawParser.parseFile('model.ldr');
```

### 6.3 CAD 转换工具

**格式转换**：
- **LDraw → Studio**：Studio 原生支持导入
- **Studio → LDraw**：可导出为 .ldr 格式
- **LXF → LDraw**：LDD 文件可转换
- **LDraw → Blender**：通过 Blender LDraw 插件

**Blender 插件**：
- **Import-Export: LDraw**：官方 Blender 插件
- **Brickson**：LEGO 风格渲染
- **Brickit**：LEGO 模型生成

**OpenSCAD**：
- **ldraw-scad**：LDraw 零件的 OpenSCAD 库
- 可用于 3D 打印准备

### 6.4 3D 打印相关工具

#### 零件复制工具

**Bricksmith**：
- macOS 上的 LDraw 编辑器
- 支持导出为 3D 打印格式

**LDCad**：
- 跨平台 LDraw CAD 工具
- 支持动画和物理模拟

#### 3D 打印准备

**公差计算器**：
- 计算 LEGO 兼容零件的适当公差
- 考虑材料收缩率

**连接强度分析**：
- 有限元分析工具
- 预测打印零件的强度

**切片软件配置**：
- 针对 LEGO 零件优化的切片配置
- 推荐层高、填充率等参数

---

## 7. 社区资源

### 7.1 官方论坛

**BrickLink 论坛**：https://forum.bricklink.com/

**板块分类**：
- **News & Announcements**：官方公告
- **BrickLink Studio**：Studio 软件讨论
- **Wanted & For Sale**：交易信息
- **MOCs**：作品展示
- **General LEGO Discussion**：综合讨论
- **Technical Support**：技术支持

### 7.2 Rebrickable 社区

**Rebrickable**：https://rebrickable.com/

**功能**：
- **MOC 分享**：用户上传自定义设计
- **零件清单**：可购买零件构建 MOC
- **收藏管理**：追踪个人零件收藏
- **构建挑战**：定期举办设计比赛
- **论坛**：活跃的讨论社区

**统计数据**：
- 超过 50,000 个 MOC
- 超过 100,000 注册用户
- 每日新增设计

### 7.3 MOC（My Own Creation）分享

**主要平台**：

1. **BrickLink Studio Gallery**
   - 官方画廊
   - 可直接下载 .io 文件
   - 员工精选作品

2. **Rebrickable MOCs**
   - 最大的 MOC 数据库
   - 提供零件清单和购买链接
   - 支持付费和免费设计

3. **Eurobricks**
   - 欧洲最大 LEGO 论坛
   - MOC 展示板块
   - 深度讨论和技术分享

4. **Reddit r/lego**
   - 150 万 + 订阅者
   - 每日 MOC 分享
   - 快速反馈和讨论

5. **Flickr LEGO Groups**
   - 高质量摄影展示
   - 专业拍摄技巧
   - 主题群组

### 7.4 教程和指南

**官方教程**：
- **BrickLink Studio 帮助**：https://studiohelp.bricklink.com/
  - 入门指南
  - 功能教程
  - 常见问题

**社区教程**：

**YouTube 频道**：
- **Brick Experiment Channel**：高级搭建技巧
- **LEGO Master Builder Academy**：官方教程
- **Beyond the Brick**：采访和展示

**文字教程**：
- **LDraw.org Wiki**：https://wiki.ldraw.org/
  - 文件格式详解
  - 工具使用指南
  - 零件提交规范

**书籍**：
- 《The Unofficial LEGO Builder's Guide》
- 《LEGO MOC Design Books》系列

---

## 8. 与 3D 打印的结合

### 8.1 积木风格 3D 打印设计

**设计原则**：

1. **模块化设计**
   - 使用标准 LEGO 连接方式
   - 便于扩展和修改
   - 考虑零件互换性

2. **凸点（Studs）设计**
   - 标准凸点直径：4.8mm
   - 凸点高度：1.7mm
   - 凸点间距：8mm（中心到中心）

3. **管状结构（Tubes）**
   - 底部管状结构提供连接强度
   - 内壁厚度：0.8-1.0mm
   - 考虑打印方向

### 8.2 零件复制注意事项

**法律考虑**：
- ⚠️ **LEGO 商标**：不得使用 LEGO 商标销售兼容零件
- ⚠️ **专利**：部分 LEGO 设计仍有专利保护
- ⚠️ **版权**：特定形状可能受版权保护
- ✅ **个人使用**：通常允许个人 3D 打印复制
- ✅ **兼容声明**：可以说"与 LEGO 兼容"，但不能说"LEGO 零件"

**技术考虑**：
- **尺寸精度**：需要高精度打印机
- **表面处理**：可能需要后处理
- **颜色匹配**：难以完全匹配 LEGO 颜色
- **材料选择**：PLA、ABS、PETG 各有优劣

### 8.3 连接结构强度

**关键连接类型**：

1. **凸点 - 管连接**
   - 标准 LEGO 连接方式
   - 保持力：约 20-30N
   - 3D 打印建议：增加 0.05-0.1mm 过盈配合

2. **Technic 销连接**
   - 直径：3mm 销
   - 孔直径：3.2-3.3mm（考虑公差）
   - 摩擦配合或弹性配合

3. **板层连接**
   - 标准板高度：3.2mm（含凸点）
   - 无凸点板：2.4mm
   - 确保层间粘合强度

**强度优化**：
- **填充率**：建议 40-60%
- **壁厚**：至少 1.2mm（3 层）
- **打印方向**：沿受力方向分层
- **材料**：ABS 或 PETG 比 PLA 更耐用

### 8.4 公差和配合

**LEGO 官方公差**：
- 零件尺寸公差：±0.002mm（2 微米）
- 模具精度：极高
- 注塑工艺：保证一致性

**3D 打印公差建议**：

| 配合类型 | 间隙/过盈 | 应用场景 |
|---------|----------|---------|
| 松动配合 | +0.15-0.2mm | 可滑动连接 |
| 标准配合 | +0.1-0.15mm | 一般连接 |
| 紧密配合 | +0.05-0.1mm | 牢固连接 |
| 过盈配合 | -0.05-0mm | 永久固定 |

**凸点配合**：
- 凸点直径设计：4.75-4.8mm
- 孔直径设计：4.9-5.0mm
- 考虑材料收缩率（PLA 约 0.2-0.5%）

**管状结构配合**：
- 外径：根据具体零件
- 内径：外径 + 0.15-0.2mm
- 壁厚：至少 0.8mm

**测试和迭代**：
1. 打印测试件
2. 测量实际尺寸
3. 调整设计公差
4. 重复测试直到满意

**打印机校准**：
- 校准挤出倍率
- 校准steps/mm
- 测试不同方向的尺寸精度
- 考虑热膨胀影响

---

## 附录

### A. 快速参考

**常用链接**：
- BrickLink 主页：https://www.bricklink.com/
- BrickLink Studio：https://www.bricklink.com/v3/studio/main.page
- LDraw.org：https://www.ldraw.org/
- Rebrickable：https://rebrickable.com/
- BrickLink 论坛：https://forum.bricklink.com/

**常用 API**：
- BrickLink API：https://api.bricklink.com/
- Rebrickable API：https://rebrickable.com/api/

### B. 术语表

| 术语 | 解释 |
|------|------|
| MOC | My Own Creation，自定义设计 |
| LDraw | 开源 LEGO CAD 格式 |
| LDD | LEGO Digital Designer，已停产的官方设计软件 |
| BOM | Bill of Materials，零件清单 |
| Stud | 凸点，LEGO 零件顶部的圆柱 |
| Technic | LEGO 机械组系列 |
| BNOT | Brick Notation，零件描述符号 |

### C. 贡献者

本文档由社区调研整理，欢迎贡献和更新。

---

*本文档仅供参考，所有商标信息归各自所有者所有。LEGO® 是 LEGO 集团的注册商标。*
