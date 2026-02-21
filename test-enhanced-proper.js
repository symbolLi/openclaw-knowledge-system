#!/usr/bin/env node

const webFetcher = require('./lib/web-fetcher');

async function testEnhanced() {
  const url = 'https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw';
  console.log('🧪 Testing Enhanced Web Fetcher');
  console.log('🔗 URL:', url);
  
  try {
    const result = await webFetcher.fetchWebpage(url);
    if (result.success) {
      console.log('✅ Success!');
      console.log('Status:', result.status);
      console.log('Content length:', result.html.length);
      
      // 检查是否还是验证页面
      if (result.html.includes('环境异常')) {
        console.log('⚠️ Still getting verification page (anti-bot detected)');
      } else {
        console.log('🎉 Successfully bypassed anti-bot protection!');
      }
    } else {
      console.log('❌ Failed:', result.error);
    }
  } catch (error) {
    console.log('💥 Test error:', error.message);
  }
}

testEnhanced();