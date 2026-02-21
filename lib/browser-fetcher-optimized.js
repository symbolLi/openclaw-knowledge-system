const puppeteer = require('puppeteer');

/**
 * 浏览器抓取器 - 使用真实浏览器绕过反爬虫
 */
class BrowserFetcher {
  constructor() {
    this.timeout = 30000; // 30秒超时
    this.loadTimeout = 15000; // 页面加载超时
  }

  async fetch(url) {
    let browser = null;
    let page = null;
    
    try {
      // 启动浏览器（内存优化配置）
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--single-process',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled'
        ],
        executablePath: '/usr/bin/chromium-browser',
        timeout: this.timeout
      });

      // 创建新页面
      page = await browser.newPage();
      
      // 设置更真实的浏览器环境
      await this.setupRealisticBrowser(page);
      
      // 禁用图片和媒体以节省资源
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`📡 Navigating to: ${url}`);
      
      // 导航到目标页面
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: this.loadTimeout 
      });
      
      if (!response) {
        throw new Error('页面导航失败');
      }

      // 等待页面完全加载（针对微信等SPA应用）
      await this.waitForPageReady(page, url);
      
      // 获取完整HTML内容
      const html = await page.content();
      const title = await page.title();
      
      // 关闭浏览器释放资源
      await browser.close();
      
      return {
        success: true,
        url: page.url(),
        html: html,
        title: title,
        status: response.status()
      };
      
    } catch (error) {
      console.error('Browser fetch error:', error.message);
      
      // 确保资源被释放
      if (browser) {
        await browser.close().catch(() => {});
      }
      
      if (error.message.includes('Timeout')) {
        return { success: false, error: '请求超时，请稍后重试' };
      } else if (error.message.includes('Navigation failed')) {
        return { success: false, error: '页面加载失败，请检查链接是否正确' };
      } else {
        return { success: false, error: `浏览器抓取失败: ${error.message}` };
      }
    }
  }

  /**
   * 设置更真实的浏览器环境
   */
  async setupRealisticBrowser(page) {
    // 移除WebDriver属性（反自动化检测）
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // 设置真实的User-Agent
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';
    await page.setUserAgent(userAgent);

    // 设置视口大小
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // 模拟常见的浏览器属性
    await page.evaluateOnNewDocument(() => {
      // 模拟常见的navigator属性
      window.chrome = {
        runtime: {},
        loadTimes: () => {}
      };
      
      // 模拟plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // 模拟languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en-US', 'en'],
      });
    });
  }

  /**
   * 等待页面完全加载（针对不同网站的特殊处理）
   */
  async waitForPageReady(page, url) {
    try {
      if (url.includes('mp.weixin.qq.com')) {
        // 微信公众号文章特殊处理
        // 等待文章内容区域出现
        await page.waitForSelector('.rich_media_content, #js_content, .article-content', { 
          timeout: 10000,
          visible: true 
        }).catch(() => {
          // 如果找不到特定元素，等待通用内容
          console.log('⚠️ 微信文章特定元素未找到，使用通用等待');
        });
        
        // 额外等待确保JS执行完成
        await page.waitForTimeout(3000);
      } else if (url.includes('zhihu.com')) {
        // 知乎特殊处理
        await page.waitForSelector('.ContentItem, .AnswerItem, .QuestionPage', { 
          timeout: 10000,
          visible: true 
        }).catch(() => {
          console.log('⚠️ 知乎特定元素未找到，使用通用等待');
        });
        await page.waitForTimeout(2000);
      } else {
        // 通用等待
        await page.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('⚠️ 页面等待超时，继续处理:', error.message);
    }
  }
}

module.exports = new BrowserFetcher();