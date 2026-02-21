const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * AI客户端 - 封装OpenClaw内置模型调用
 */
class AIClient {
  constructor() {
    // 从环境变量或配置中获取OpenClaw API信息
    this.port = process.env.OPENCLAW_GATEWAY_PORT || '18324';
    this.token = process.env.OPENCLAW_GATEWAY_TOKEN || null;
    this.model = process.env.AI_MODEL || 'alibaba-cloud/qwen3-max-2026-01-23';
    
    // 构建基础URL
    this.baseUrl = `http://localhost:${this.port}`;
    
    // 预设分类列表
    this.categories = [
      '前端', '后端', '大数据', 'AI', '自动驾驶', '数据闭环', '仿真评测', '产品', '设计', '生活'
    ];
  }

  /**
   * 调用AI模型进行智能处理
   * @param {string} content - 要处理的文章内容
   * @param {string} title - 文章标题
   * @returns {Promise<Object>} 处理结果 {category, summary, keywords}
   */
  async processContent(content, title) {
    try {
      // 构建提示词
      const prompt = this.buildPrompt(content, title);
      
      // 调用AI模型
      const response = await this.callModel(prompt);
      
      // 解析响应
      const result = this.parseResponse(response);
      
      // 验证结果
      this.validateResult(result);
      
      return result;
    } catch (error) {
      console.error('AI processing failed:', error.message);
      throw new Error(`AI模型调用失败: ${error.message}`);
    }
  }

  /**
   * 构建AI提示词
   */
  buildPrompt(content, title) {
    // 截断内容以避免超出token限制
    const truncatedContent = this.truncateContent(content, 8000);
    
    return `你是一个专业的知识管理助手，请对以下文章进行智能分析：

文章标题：${title}

文章内容：
${truncatedContent}

请严格按照以下JSON格式返回结果，不要包含任何其他内容：
{
  "category": "从以下分类中选择最合适的：前端、后端、大数据、AI、自动驾驶、数据闭环、仿真评测、产品、设计、生活",
  "summary": "生成100-150字的摘要，概括文章核心内容",
  "keywords": "提取3-5个关键词，用逗号分隔"
}`;
  }

  /**
   * 调用AI模型
   */
  async callModel(prompt) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
    
    const payload = {
      model: this.model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    };
    
    try {
      const response = await axios.post(`${this.baseUrl}/v1/chat/completions`, payload, { 
        headers,
        timeout: 30000 // 30秒超时
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        console.error('AI API error:', error.response.status, error.response.data);
        throw new Error(`AI API错误: ${error.response.status}`);
      } else if (error.request) {
        console.error('AI API request error:', error.message);
        throw new Error('AI API请求失败，请检查OpenClaw服务是否运行');
      } else {
        throw error;
      }
    }
  }

  /**
   * 解析AI响应
   */
  parseResponse(response) {
    try {
      // 尝试解析JSON
      let jsonStr = response.trim();
      
      // 移除可能的Markdown代码块标记
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      
      const result = JSON.parse(jsonStr);
      
      return {
        category: result.category || '其他',
        summary: result.summary || '',
        keywords: result.keywords || ''
      };
    } catch (error) {
      console.error('Failed to parse AI response:', response);
      throw new Error('AI响应格式错误，无法解析JSON');
    }
  }

  /**
   * 验证结果
   */
  validateResult(result) {
    // 验证分类
    if (!this.categories.includes(result.category)) {
      console.warn(`Invalid category: ${result.category}, defaulting to '其他'`);
      result.category = '其他';
    }
    
    // 验证摘要长度
    const summaryLength = result.summary.length;
    if (summaryLength < 50) {
      throw new Error('摘要太短，不符合要求');
    }
    if (summaryLength > 200) {
      result.summary = result.summary.substring(0, 150) + '...';
    }
    
    // 验证关键词
    if (!result.keywords || result.keywords.trim().length === 0) {
      throw new Error('关键词提取失败');
    }
    
    const keywordCount = result.keywords.split(',').length;
    if (keywordCount < 3 || keywordCount > 5) {
      console.warn(`Keyword count ${keywordCount} is outside expected range (3-5)`);
    }
  }

  /**
   * 截断内容以避免超出token限制
   */
  truncateContent(content, maxLength) {
    if (content.length <= maxLength) {
      return content;
    }
    
    // 在句子边界处截断
    const truncated = content.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('！'),
      truncated.lastIndexOf('?'),
      truncated.lastIndexOf('？')
    );
    
    if (lastSentenceEnd > maxLength * 0.8) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }
    
    return truncated;
  }

  /**
   * 获取预设分类列表
   */
  getCategories() {
    return this.categories;
  }
}

module.exports = new AIClient();