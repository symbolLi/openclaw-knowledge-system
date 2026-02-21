const axios = require('axios');
const { JSDOM } = require('jsdom');

class WebFetcher {
  constructor() {
    this.timeout = 15000; // 15秒超时
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
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
  }

  async fetch(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: this.headers,
        maxRedirects: 5,
        httpsAgent: new (require('https')).Agent({  
          rejectUnauthorized: false
        }),
        // 禁用自动重定向以更好地控制
        maxRedirects: 3
      });
      
      return {
        success: true,
        url: response.config.url,
        html: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Web fetch error:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        return { success: false, error: '请求超时，请稍后重试' };
      }
      
      if (error.response) {
        const status = error.response.status;
        if (status === 403) {
          // 尝试更宽松的请求头
          return await this.fetchWithFallback(url);
        } else if (status === 404) {
          return { success: false, error: '页面不存在（404）' };
        } else if (status >= 500) {
          return { success: false, error: `服务器错误（${status}）` };
        } else {
          return { success: false, error: `HTTP错误（${status}）` };
        }
      }
      
      return { success: false, error: '网络连接失败，请检查链接是否正确' };
    }
  }

  // 备用请求策略
  async fetchWithFallback(url) {
    try {
      const fallbackHeaders = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      };

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: fallbackHeaders,
        maxRedirects: 3,
        httpsAgent: new (require('https')).Agent({  
          rejectUnauthorized: false
        })
      });
      
      return {
        success: true,
        url: response.config.url,
        html: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (fallbackError) {
      return { success: false, error: '反爬虫保护较强，无法自动抓取' };
    }
  }
}

module.exports = new WebFetcher();