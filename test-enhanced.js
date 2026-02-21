#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { fetchWebpage } = require('./lib/web-fetcher-enhanced');

async function testEnhanced(url) {
  console.log('🧪 Testing Enhanced Web Fetcher');
  console.log('🔗 URL:', url);
  
  try {
    const result = await fetchWebpage(url);
    if (result.success) {
      console.log('✅ Enhanced fetch successful!');
      console.log('Status:', result.status);
      console.log('Content length:', result.html.length);
      
      // 检查是否还是验证页面
      if (result.html.includes('环境异常') || result.html.includes('验证')) {
        console.log('⚠️ Still getting verification page');
      } else {
        console.log('🎉 Got real content!');
        // 提取标题预览
        const titleMatch = result.html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          console.log('Title:', titleMatch[1].substring(0, 100));
        }
      }
    } else {
      console.log('❌ Enhanced fetch failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

// 测试微信链接
testEnhanced('https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw');