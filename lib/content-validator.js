/**
 * 内容验证器 - 检测是否为反爬虫验证页面
 */
class ContentValidator {
  
  /**
   * 检测是否为验证页面
   * @param {string} html - HTML内容
   * @param {string} url - 原始URL
   * @returns {boolean} 是否为验证页面
   */
  isVerificationPage(html, url) {
    const lowerHtml = html.toLowerCase();
    
    // 微信验证页面特征
    if (url.includes('mp.weixin.qq.com')) {
      const wxIndicators = [
        '环境异常',
        '完成验证后即可继续访问',
        '去验证',
        'security_verify'
      ];
      
      return wxIndicators.some(indicator => lowerHtml.includes(indicator.toLowerCase()));
    }
    
    // 知乎验证页面特征
    if (url.includes('zhihu.com')) {
      const zhihuIndicators = [
        '安全验证',
        '人机验证',
        'captcha',
        'verification'
      ];
      
      return zhihuIndicators.some(indicator => lowerHtml.includes(indicator));
    }
    
    // 通用验证页面特征
    const generalIndicators = [
      'verify you are human',
      'please complete security check',
      'anti-bot',
      'robot verification'
    ];
    
    return generalIndicators.some(indicator => lowerHtml.includes(indicator));
  }
  
  /**
   * 获取用户友好的处理建议
   * @param {string} url 
   * @returns {string} 建议文本
   */
  getHandlingSuggestion(url) {
    if (url.includes('mp.weixin.qq.com')) {
      return '⚠️ 微信文章无法自动抓取，请手动复制文章内容并发送给我，我会直接进行智能处理。';
    } else if (url.includes('zhihu.com')) {
      return '⚠️ 知乎内容无法自动抓取，请手动复制内容并发送给我，我会直接进行智能处理。';
    } else {
      return '⚠️ 该页面无法自动抓取，请手动复制内容并发送给我，我会直接进行智能处理。';
    }
  }
}

module.exports = new ContentValidator();