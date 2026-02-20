# OpenClaw知识库系统 - 方案设计文档

## 📋 **项目概述**

### 1.1 项目目标
构建一个基于OpenClaw的个人知识库管理系统，实现：
- **自动化文章处理**：自动抓取、分类、摘要技术文章
- **图片知识管理**：存储和管理带元数据的图片
- **智能搜索功能**：按关键词、分类、时间范围检索知识
- **版本化部署**：开发/生产环境分离，确保系统稳定性

### 1.2 技术栈
- **主语言**: Node.js (ES6+)
- **数据库**: SQLite3
- **AI模型**: OpenClaw内置Qwen3-Max
- **版本控制**: Git + GitHub
- **部署模式**: 命令行工具（被OpenClaw调用）

---

## 🔧 **系统架构**

### 2.1 整体架构
```
OpenClaw Gateway
├── 消息路由系统
│   ├── URL检测 → article-handler
│   ├── 图片+文字 → image-handler  
│   └── "搜索"命令 → search-handler
└── 命令执行系统
    └── 调用 knowledge-handler.js

knowledge-handler.js (Node.js)
├── handlers/
│   ├── article-handler.js    # 文章处理
│   ├── image-handler.js      # 图片处理
│   └── search-handler.js     # 搜索功能
├── lib/
│   ├── database.js           # SQLite操作
│   ├── file-manager.js       # 文件系统操作
│   └── ai-client.js          # AI模型调用
└── config/settings.js        # 配置管理
```

### 2.2 数据流
```
用户输入 → OpenClaw → knowledge-handler.js → 
    ↓
[AI处理] ←→ [文件存储] ←→ [数据库]
    ↓
结果返回 → OpenClaw → 用户
```

---

## 🗄️ **数据设计**

### 3.1 数据库结构
```sql
-- knowledge.db
CREATE TABLE articles (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,           -- 'article' | 'image'
    url TEXT,                     -- 原始URL（文章）
    title TEXT NOT NULL,
    summary TEXT,
    category TEXT NOT NULL,       -- 预设分类
    keywords TEXT,                -- 关键词（文章）
    content_path TEXT,            -- 内容文件路径（文章）
    image_path TEXT,              -- 图片路径（图片）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 文件存储结构
```
/home/admin/.openclaw/workspace/knowledge/
├── knowledge.db
├── articles/
│   └── 2026/02/
│       └── 1708156800000.md
└── images/
    └── 2026/02/
        └── 1708156800000.jpg
```

### 3.3 预设分类
- 前端
- 后端  
- 大数据
- AI
- 自动驾驶
- 数据闭环
- 仿真评测
- 产品
- 设计
- 生活

---

## 🚀 **功能规格**

### 4.1 文章处理功能
**触发条件**: 用户发送HTTP/HTTPS链接
**处理流程**:
1. 使用`web_fetch`抓取网页内容
2. 调用Qwen3-Max进行AI分析：
   - 分类（从预设分类中选择）
   - 生成100-150字摘要
   - 提取3-5个关键词
3. 保存原始内容到`articles/`目录
4. 插入数据库记录
5. 返回结构化结果

**输出格式**:
```
✅ 已保存：文章标题
分类：AI
摘要：详细介绍了Qwen3-Max模型的应用...
关键词：OpenClaw,AI,大模型
```

### 4.2 图片管理功能
**触发条件**: 用户发送图片 + 文字说明
**文字格式**: `标题:xxx 分类:xxx 摘要:xxx`
**处理流程**:
1. 解析文字说明
2. 保存图片到`images/`目录
3. 插入数据库记录
4. 返回确认消息

**输出格式**:
```
✅ 图片已入库：Git操作（分类：后端）
```

### 4.3 智能搜索功能
**触发条件**: 用户发送"搜索"开头的消息
**命令格式**: `搜索 [关键词] 分类:[分类名] 时间:[week/month/year]`
**处理流程**:
1. 解析搜索参数
2. 构建SQL查询
3. 执行数据库查询
4. 格式化搜索结果

**输出格式**:
```
🔍 找到 2 条记录：

1. 📄 OpenClaw知识库系统设计
   分类：AI  |  时间：2026-02-20
   摘要：详细介绍了知识库系统架构...

2. 🖼️ Git操作流程图
   分类：后端  |  时间：2026-02-20
   摘要：Git版本控制操作示意图
```

---

## ⚙️ **部署架构**

### 5.1 环境分离
```
# 开发环境（代码生成和测试）
/home/admin/.openclaw/workspace/knowledge-system-dev/

# 生产环境（实际运行）
/home/admin/.openclaw/workspace/knowledge-system-prod/

# 数据存储（共享）
/home/admin/.openclaw/workspace/knowledge/
```

### 5.2 版本管理
- **初始版本**: v0.0.1
- **分支策略**: 
  - `main`: 稳定版本
  - `develop`: 开发分支
- **标签策略**: 语义化版本号（v0.0.1, v0.1.0, v1.0.0...）

### 5.3 OpenClaw集成配置
```json
{
  "commands": {
    "custom": {
      "article_process": "node /home/admin/.openclaw/workspace/knowledge-system-prod/knowledge-handler.js article",
      "image_process": "node /home/admin/.openclaw/workspace/knowledge-system-prod/knowledge-handler.js image", 
      "knowledge_search": "node /home/admin/.openclaw/workspace/knowledge-system-prod/knowledge-handler.js search"
    }
  },
  "agents": {
    "defaults": {
      "env": {
        "KNOWLEDGE_DB_PATH": "/home/admin/.openclaw/workspace/knowledge/knowledge.db",
        "KNOWLEDGE_DATA_DIR": "/home/admin/.openclaw/workspace/knowledge",
        "DEFAULT_CATEGORIES": "前端,后端,大数据,AI,自动驾驶,数据闭环,仿真评测,产品,设计,生活"
      }
    }
  }
}
```

---

## 🛡️ **安全与稳定性**

### 6.1 安全措施
- **权限隔离**: 脚本只在指定目录操作
- **SQL注入防护**: 使用参数化查询
- **文件路径安全**: 限制文件操作范围
- **错误处理**: 完整的异常捕获和日志记录

### 6.2 稳定性保障
- **环境分离**: 开发/生产环境完全隔离
- **版本控制**: 只有tag版本才能部署到生产
- **回滚机制**: 部署脚本自动备份
- **资源限制**: 限制并发处理数量

### 6.3 监控与日志
- **操作日志**: 记录所有处理操作
- **错误日志**: 详细记录异常信息
- **性能监控**: 记录处理时间和资源使用

---

## 📋 **实施计划**

### 7.1 阶段1：开发环境搭建（v0.0.1）
1. 在`knowledge-system-dev/`生成完整代码
2. 实现核心功能（文章处理、图片管理、搜索）
3. 本地测试验证
4. 推送到GitHub main分支
5. 打tag v0.0.1

### 7.2 阶段2：生产环境部署
1. 克隆v0.0.1到`knowledge-system-prod/`
2. 配置OpenClaw指向生产环境
3. 在生产环境测试功能
4. 验证系统稳定性

### 7.3 阶段3：迭代优化
1. 收集使用反馈
2. 修复bug和性能问题
3. 添加新功能
4. 发布v0.1.0

---

## 📁 **项目结构**

```
openclaw-knowledge-system/
├── package.json              # 依赖和脚本
├── .gitignore               # 忽略文件
├── README.md                # 项目文档
├── knowledge-handler.js      # 主入口文件
├── config/
│   └── settings.js          # 配置管理
├── lib/
│   ├── database.js          # 数据库操作
│   ├── file-manager.js      # 文件系统操作  
│   └── ai-client.js         # AI模型调用
├── handlers/
│   ├── article-handler.js   # 文章处理
│   ├── image-handler.js     # 图片处理
│   └── search-handler.js    # 搜索功能
├── tests/
│   └── test-handlers.js     # 单元测试
└── deploy/
    └── deploy.sh            # 部署脚本
```

---

## 🎯 **预期效果**

### 用户体验
```
用户: https://mp.weixin.qq.com/s/xxx
助手: ✅ 已保存：OpenClaw知识库系统设计
      分类：AI
      摘要：详细介绍了知识库系统架构...
      关键词：OpenClaw,知识库,AI

用户: [上传图片] 标题:Git操作 分类:后端
助手: ✅ 图片已入库：Git操作（分类：后端）

用户: 搜索 AI 分类:AI 时间:week
助手: 🔍 找到 1 条记录：
      1. 📄 OpenClaw知识库系统设计...
```

### 技术优势
- ✅ **稳定性**: 不依赖自定义skill，使用OpenClaw稳定功能
- ✅ **可维护性**: 模块化设计，易于调试和修改
- ✅ **扩展性**: 可以轻松添加新功能
- ✅ **安全性**: 权限隔离，错误处理完善
- ✅ **版本控制**: Git管理，支持回滚和协作

---

**文档版本**: v0.0.1  
**最后更新**: 2026-02-20  
**状态**: 待确认