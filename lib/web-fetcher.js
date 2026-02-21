const axios = require('axios');
const { JSDOM } = require('jsdom');

class WebFetcher {
  constructor() {
    this.timeout = 15000; // 15秒超时
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async fetch(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent },
        maxRedirects: 5
      });
      
      return {
        success: true,
        url: response.config.url, // 最终URL（可能重定向）
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
        if (status === 404) {
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
}

// 导出实例和类
const webFetcher = new WebFetcher();
module.exports = {
  fetchWebpage: webFetcher.fetch.bind(webFetcher),
  WebFetcher: WebFetcher
};