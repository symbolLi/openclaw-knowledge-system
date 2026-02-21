#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testSimplePage() {
  console.log('🧪 Testing Browser with Simple Page');
  console.log('🔗 URL: https://example.com');
  
  let browser;
  try {
    // 启动浏览器
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security'
      ],
      executablePath: '/usr/bin/chromium-browser'
    });
    
    console.log('✅ Browser launched successfully!');
    
    // 打开页面
    const page = await browser.newPage();
    console.log('📄 Creating new page...');
    
    // 设置超时
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);
    
    // 访问简单页面
    console.log('📡 Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    // 获取内容
    const content = await page.content();
    const title = await page.title();
    
    console.log('✅ Page loaded successfully!');
    console.log(`Title: ${title}`);
    console.log(`Content length: ${content.length} characters`);
    
    await browser.close();
    console.log('✅ Browser closed successfully!');
    
  } catch (error) {
    console.error('❌ Browser test failed:', error.message);
    if (browser) {
      await browser.close();
      console.log('✅ Browser closed after error');
    }
    process.exit(1);
  }
}

testSimplePage().catch(console.error);