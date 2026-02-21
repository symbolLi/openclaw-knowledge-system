const puppeteer = require('puppeteer');
const path = require('path');

/**
 * 浏览器抓取器 - 使用Puppeteer绕过反爬虫
 */
class BrowserFetcher {
  constructor() {
    this.timeout = 30000; // 30秒超时
    this.maxWaitTime = 45000; // 最大等待时间45秒
  }

  /**
   * 抓取网页内容
   * @param {string} url - 要抓取的URL
   * @returns {Promise<Object>} 抓取结果
   */
  async fetch(url) {
    let browser = null;
    let page = null;
    
    try {
      // 启动浏览器
      browser = await puppeteer.launch({
        headless: 'new',
        timeout: 30000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        executablePath: '/usr/bin/chromium-browser'
      });

      page = await browser.newPage();
      
      // 设置页面超时
      await page.setDefaultTimeout(this.timeout);
      await page.setDefaultNavigationTimeout(this.timeout);
      
      // 禁用图片和媒体加载以节省资源
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'media', 'font', 'stylesheet'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`📡 Navigating to: ${url}`);
      
      // 导航到页面
      const response = await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: this.timeout
      });

      if (!response) {
        throw new Error('页面导航失败');
      }

      // 等待页面主要内容加载
      await this.waitForContent(page, url);

      // 获取完整HTML
      const html = await page.content();
      const finalUrl = page.url();
      
      // 关闭浏览器
      await browser.close();
      browser = null;

      return {
        success: true,
        url: finalUrl,
        html: html,
        status: response.status(),
        headers: response.headers()
      };

    } catch (error) {
      console.error('Browser fetch error:', error.message);
      
      // 确保资源被清理
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Failed to close browser:', closeError.message);
        }
      }
      
      // 分析错误类型
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return { success: false, error: '请求超时，请稍后重试' };
      }
      
      if (error.message.includes('navigation') || error.message.includes('Navigation')) {
        return { success: false, error: '页面导航失败，可能是网络问题' };
      }
      
      if (error.message.includes('memory') || error.message.includes('Memory')) {
        return { success: false, error: '服务器内存不足，请稍后重试' };
      }
      
      return { success: false, error: `抓取失败: ${error.message}` };
    }
  }

  /**
   * 等待页面主要内容加载
   */
  async waitForContent(page, url) {
    try {
      // 微信文章特定等待
      if (url.includes('mp.weixin.qq.com')) {
        // 等待文章标题出现
        await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {});
        // 等待文章内容出现
        await page.waitForSelector('.rich_media_content', { timeout: 15000 }).catch(() => {});
      }
      
      // 知乎文章特定等待
      if (url.includes('zhihu.com')) {
        // 等待问题标题
        await page.waitForSelector('h1.QuestionHeader-title', { timeout: 15000 }).catch(() => {});
        // 等待回答内容
        await page.waitForSelector('.RichContent-inner', { timeout: 15000 }).catch(() => {});
      }
      
      // 通用等待：等待页面稳定
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.warn('Content wait timeout, proceeding anyway:', error.message);
    }
  }
}

module.exports = new BrowserFetcher();