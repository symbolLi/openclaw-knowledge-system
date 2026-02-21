const puppeteer = require('puppeteer');
const path = require('path');

/**
 * 浏览器抓取器 - 使用真实浏览器绕过反爬虫
 */
class BrowserFetcher {
  constructor() {
    this.timeout = 30000; // 30秒超时
    this.launchOptions = {
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
        '--disable-blink-features=AutomationControlled',
        '--window-size=1920,1080'
      ],
      executablePath: '/usr/bin/chromium-browser'
    };
    
    // 真实的浏览器指纹配置
    this.emulationConfig = {
      viewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      locale: 'zh-CN'
    };
  }

  async fetch(url) {
    let browser = null;
    let page = null;
    
    try {
      console.log('🚀 Launching browser...');
      browser = await puppeteer.launch(this.launchOptions);
      console.log('✅ Browser launched successfully!');
      
      page = await browser.newPage();
      console.log('📄 Creating new page...');
      
      // 设置浏览器指纹
      await this.setBrowserFingerprint(page);
      
      // 禁用图片和媒体以节省资源
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'media', 'font'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      // 导航到目标URL
      console.log(`📡 Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: this.timeout 
      });
      
      // 模拟用户行为
      await this.simulateUserBehavior(page);
      
      // 等待页面完全加载
      await this.waitForPageReady(page);
      
      // 获取完整HTML
      const html = await page.content();
      const title = await page.title();
      
      console.log('✅ Page loaded successfully!');
      console.log(`Title: ${title}`);
      console.log(`Content length: ${html.length} characters`);
      
      return {
        success: true,
        url: page.url(),
        html: html,
        title: title,
        status: 200
      };
      
    } catch (error) {
      console.error('Browser fetch error:', error.message);
      
      if (error.message.includes('Timeout')) {
        return { success: false, error: '页面加载超时，请稍后重试' };
      }
      
      if (error.message.includes('Navigation timeout')) {
        return { success: false, error: '页面导航超时，请检查链接是否正确' };
      }
      
      return { success: false, error: `浏览器抓取失败: ${error.message}` };
    } finally {
      // 确保资源释放
      if (page) {
        await page.close().catch(() => {});
      }
      if (browser) {
        await browser.close().catch(() => {});
        console.log('✅ Browser closed successfully!');
      }
    }
  }

  /**
   * 设置浏览器指纹
   */
  async setBrowserFingerprint(page) {
    // 设置视口和用户代理
    await page.setViewport(this.emulationConfig.viewport);
    await page.setUserAgent(this.emulationConfig.userAgent);
    
    // 注入JavaScript来隐藏自动化特征
    await page.evaluateOnNewDocument(() => {
      // 移除WebDriver属性
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // 移除其他自动化检测特征
      window.chrome = {
        runtime: {},
        // Add other chrome properties as needed
      };
      
      // 隐藏语言检测
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en-US', 'en'],
      });
      
      // 隐藏插件检测
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });
  }

  /**
   * 模拟用户行为
   */
  async simulateUserBehavior(page) {
    try {
      // 随机滚动
      await page.evaluate(() => {
        window.scrollBy(0, Math.random() * 200);
      });
      
      // 随机等待
      await page.waitForTimeout(1000 + Math.random() * 2000);
      
      // 再次滚动到底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await page.waitForTimeout(500 + Math.random() * 1000);
      
    } catch (error) {
      console.warn('User behavior simulation failed:', error.message);
      // 不影响主要功能
    }
  }

  /**
   * 等待页面准备就绪
   */
  async waitForPageReady(page) {
    try {
      // 等待常见的内容加载完成
      await Promise.race([
        page.waitForFunction(() => {
          // 等待页面有实际内容
          const bodyText = document.body.innerText || '';
          return bodyText.length > 100;
        }, { timeout: 10000 }),
        page.waitForTimeout(15000)
      ]);
    } catch (error) {
      console.warn('Page ready check failed:', error.message);
      // 继续执行，不阻塞
    }
  }
}

module.exports = new BrowserFetcher();