const TurndownService = require('turndown');
const turndownService = new TurndownService();

/**
 * 内容提取器 - 从HTML中提取结构化内容
 */
class ContentExtractor {
  /**
   * 提取网页内容
   * @param {string} html - HTML内容
   * @param {string} url - 原始URL（用于特殊处理）
   * @returns {Object} 提取的内容对象
   */
  extract(html, url) {
    // 提取标题
    let title = this.extractTitle(html);
    
    // 提取发布时间
    let publishedAt = this.extractPublishedAt(html, url);
    
    // 提取正文内容（HTML转Markdown）
    let content = this.extractContent(html);
    
    // 提取图片链接
    let images = this.extractImages(html);
    
    return {
      title,
      content,
      publishedAt,
      images
    };
  }
  
  /**
   * 提取标题
   */
  extractTitle(html) {
    // 通用标题提取
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      let title = titleMatch[1].trim();
      // 清理微信标题中的后缀
      if (title.includes('_')) {
        title = title.split('_')[0];
      }
      if (title.includes('-')) {
        const parts = title.split('-');
        if (parts.length > 1 && parts[parts.length - 1].trim().length < 10) {
          title = parts.slice(0, -1).join('-').trim();
        }
      }
      return title;
    }
    return '无标题';
  }
  
  /**
   * 提取发布时间
   */
  extractPublishedAt(html, url) {
    // 微信公众号发布时间
    if (url.includes('mp.weixin.qq.com')) {
      const wxTimeMatch = html.match(/"publish_time":"([^"]+)"/);
      if (wxTimeMatch) return wxTimeMatch[1];
      
      // 备用：查找页面中的时间信息
      const timeMatch = html.match(/(\d{4}-\d{2}-\d{2})/);
      if (timeMatch) return timeMatch[1];
    }
    
    // 掘金发布时间
    if (url.includes('juejin.cn')) {
      const juejinTimeMatch = html.match(/"createdAt":"([^"]+)"/);
      if (juejinTimeMatch) return juejinTimeMatch[1];
    }
    
    // 通用发布时间匹配
    const pubDateMatch = html.match(/"pubDate":"([^"]+)"/) ||
                         html.match(/"publishTime":"([^"]+)"/) ||
                         html.match(/"datePublished":"([^"]+)"/);
    if (pubDateMatch) return pubDateMatch[1];
    
    return null;
  }
  
  /**
   * 提取正文内容（HTML转Markdown）
   */
  extractContent(html) {
    // 移除脚本和样式标签，避免干扰转换
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // 转换为Markdown
    const markdown = turndownService.turndown(cleanHtml);
    return markdown.trim();
  }
  
  /**
   * 提取图片链接
   */
  extractImages(html) {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const images = [];
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      // 过滤掉base64图片和小图标
      const src = match[1];
      if (!src.startsWith('data:') && !src.includes('favicon') && !src.includes('icon')) {
        images.push(src);
      }
    }
    return images;
  }
}

module.exports = new ContentExtractor();