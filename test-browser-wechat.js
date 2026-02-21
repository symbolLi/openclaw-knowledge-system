#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const browserFetcher = require('./lib/browser-fetcher');

async function testWeChat() {
  const url = 'https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw';
  
  console.log('🧪 Testing Browser-based WeChat Fetcher');
  console.log('🔗 URL:', url);
  
  try {
    const result = await browserFetcher.fetch(url);
    
    if (result.success) {
      console.log('✅ Browser fetch successful!');
      console.log('Status:', result.status);
      console.log('Content length:', result.html.length);
      
      // 检查是否还是验证页面
      if (result.html.includes('环境异常') || result.html.includes('完成验证')) {
        console.log('⚠️ Still getting verification page');
      } else {
        console.log('🎉 Successfully bypassed anti-bot protection!');
        // 提取标题预览
        const titleMatch = result.html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          console.log('Title:', titleMatch[1]);
        }
      }
    } else {
      console.log('❌ Fetch failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testWeChat().catch(console.error);