#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const browserFetcher = require('./lib/browser-fetcher');

async function testWeChat() {
  console.log('🧪 Testing Browser-based WeChat Fetcher (with timeout)');
  const url = 'https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw';
  console.log('🔗 URL:', url);
  
  // 设置45秒超时
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: Browser fetch took too long')), 45000);
  });
  
  try {
    const result = await Promise.race([
      browserFetcher.fetch(url),
      timeoutPromise
    ]);
    
    if (result.success) {
      console.log('✅ Browser fetch successful!');
      console.log('Status:', result.status);
      console.log('Content length:', result.html.length);
      
      // 检查是否是真实内容还是验证页面
      const isVerification = result.html.includes('环境异常') || 
                           result.html.includes('完成验证后即可继续访问');
      
      if (isVerification) {
        console.log('⚠️ Still getting verification page');
      } else {
        console.log('🎉 Got real content!');
        // 提取标题预览
        const titleMatch = result.html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          console.log('Title:', titleMatch[1].substring(0, 100) + '...');
        }
      }
    } else {
      console.log('❌ Browser fetch failed:', result.error);
    }
  } catch (error) {
    console.log('💥 Test error:', error.message);
  }
}

testWeChat().catch(console.error);