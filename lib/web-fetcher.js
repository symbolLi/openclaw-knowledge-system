const axios = require('axios');
const { JSDOM } = require('jsdom');
const userAgentPool = require('./user-agent-pool');

class WebFetcher {
  constructor() {
    this.timeout = 15000; // 15秒超时
    this.maxRetries = 2; // 最大重试次数
    this.retryDelayMin = 5000; // 最小重试延迟 5秒
    this.retryDelayMax = 15000; // 最大重试延迟 15秒
  }

  async fetch(url) {
    let lastError = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // 随机选择User-Agent
        const userAgent = userAgentPool.getRandomUA();
        
        const headers = {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        };

        console.log(`📡 Attempt ${attempt + 1}/${this.maxRetries + 1} with UA: ${userAgent.substring(0, 50)}...`);

        const response = await axios.get(url, {
          timeout: this.timeout,
          headers: headers,
          maxRedirects: 5,
          httpsAgent: new (require('https')).Agent({  
            rejectUnauthorized: false
          })
        });
        
        // 检查是否为验证页面
        if (this.isVerificationPage(response.data, url)) {
          if (attempt < this.maxRetries) {
            const delay = this.getRandomDelay();
            console.log(`⚠️ Verification page detected, retrying in ${delay/1000} seconds...`);
            await this.sleep(delay);
            continue;
          } else {
            return { 
              success: false, 
              error: '反爬虫保护较强，多次尝试后仍无法获取内容',
              verificationPage: true
            };
          }
        }
        
        return {
          success: true,
          url: response.config.url,
          html: response.data,
          status: response.status,
          headers: response.headers
        };
        
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.getRandomDelay();
          console.log(`🔄 Retrying in ${delay/1000} seconds...`);
          await this.sleep(delay);
        }
      }
    }
    
    // 所有尝试都失败了
    if (lastError.response) {
      const status = lastError.response.status;
      if (status === 403) {
        return { success: false, error: '访问被拒绝（403），可能是反爬虫保护' };
      } else if (status === 404) {
        return { success: false, error: '页面不存在（404）' };
      } else if (status >= 500) {
        return { success: false, error: `服务器错误（${status}）` };
      }
    }
    
    return { success: false, error: '网络连接失败，请检查链接是否正确' };
  }

  // 检测验证页面
  isVerificationPage(html, url) {
    const lowerHtml = html.toLowerCase();
    
    // 微信验证页面特征
    if (url.includes('mp.weixin.qq.com')) {
      const wxIndicators = [
        '环境异常',
        '完成验证后即可继续访问', 
        '去验证',
        'security_verify',
        '验证',
        '人机验证'
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
    
    return false;
  }

  // 获取随机延迟
  getRandomDelay() {
    return Math.floor(Math.random() * (this.retryDelayMax - this.retryDelayMin + 1)) + this.retryDelayMin;
  }

  // 睡眠函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出实例
const webFetcher = new WebFetcher();
module.exports = {
  fetchWebpage: webFetcher.fetch.bind(webFetcher),
  WebFetcher: WebFetcher
};