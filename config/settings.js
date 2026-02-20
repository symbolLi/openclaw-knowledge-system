/**
 * 知识库系统配置管理
 */
class Settings {
  constructor() {
    this.dbPath = process.env.KNOWLEDGE_DB_PATH || '/home/admin/.openclaw/workspace/knowledge/knowledge.db';
    this.dataDir = process.env.KNOWLEDGE_DATA_DIR || '/home/admin/.openclaw/workspace/knowledge';
    this.defaultCategories = (process.env.DEFAULT_CATEGORIES || '前端,后端,大数据,AI,自动驾驶,数据闭环,仿真评测,产品,设计,生活').split(',');
    
    // OpenClaw配置
    this.openclawBaseUrl = process.env.OPENCLAW_BASE_URL || 'http://localhost:18324/ec8106e5';
    this.openclawToken = process.env.OPENCLAW_TOKEN || null;
  }

  /**
   * 验证配置是否有效
   */
  validate() {
    if (!this.dbPath) {
      throw new Error('KNOWLEDGE_DB_PATH is required');
    }
    if (!this.dataDir) {
      throw new Error('KNOWLEDGE_DATA_DIR is required');
    }
    return true;
  }

  /**
   * 获取默认分类列表
   */
  getDefaultCategories() {
    return this.defaultCategories;
  }
}

module.exports = new Settings();