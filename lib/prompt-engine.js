/**
 * AI提示词引擎 - 为不同任务生成优化的提示词
 */
class PromptEngine {
  constructor() {
    this.categories = [
      '前端', '后端', '大数据', 'AI', '自动驾驶', '数据闭环', '仿真评测', '产品', '设计', '生活'
    ];
  }

  /**
   * 生成文章分类提示词
   * @param {string} title - 文章标题
   * @param {string} content - 文章内容（前500字符）
   * @returns {string} 优化的提示词
   */
  generateClassificationPrompt(title, content) {
    const truncatedContent = content.substring(0, 500);
    return `你是一个专业的文章分类专家。请根据以下文章信息，从预设的分类中选择最合适的1-2个分类。

可用分类：${this.categories.join('、')}

文章标题：${title}
文章内容：${truncatedContent}

请严格按照以下JSON格式返回结果：
{
  "categories": ["分类1", "分类2"]
}

注意：
1. 只能从预设分类中选择
2. 最多选择2个分类
3. 如果不确定，选择最相关的1个分类
4. 返回纯JSON，不要包含其他任何内容`;
  }

  /**
   * 生成摘要提示词
   * @param {string} title - 文章标题
   * @param {string} content - 文章内容
   * @returns {string} 优化的提示词
   */
  generateSummaryPrompt(title, content) {
    const truncatedContent = content.substring(0, 2000); // 限制内容长度
    return `你是一个专业的文章摘要专家。请为以下文章生成一个100-150字的简洁摘要。

文章标题：${title}
文章内容：${truncatedContent}

要求：
1. 摘要长度严格控制在100-150字之间
2. 突出文章的核心观点和关键信息
3. 语言简洁明了，避免冗余
4. 保持客观，不要添加个人观点
5. 返回纯文本，不要包含其他任何内容`;
  }

  /**
   * 生成关键词提示词
   * @param {string} title - 文章标题
   * @param {string} content - 文章内容
   * @returns {string} 优化的提示词
   */
  generateKeywordsPrompt(title, content) {
    const truncatedContent = content.substring(0, 2000);
    return `你是一个专业的关键词提取专家。请从以下文章中提取3-5个最重要的关键词。

文章标题：${title}
文章内容：${truncatedContent}

要求：
1. 提取3-5个关键词
2. 关键词应该是文章的核心概念或技术术语
3. 按重要性排序
4. 用中文逗号分隔，不要包含其他任何内容
5. 返回纯文本，格式如：关键词1,关键词2,关键词3`;
  }

  /**
   * 获取预设分类列表
   */
  getCategories() {
    return this.categories;
  }

  /**
   * 验证分类是否有效
   */
  isValidCategory(category) {
    return this.categories.includes(category);
  }
}

module.exports = new PromptEngine();