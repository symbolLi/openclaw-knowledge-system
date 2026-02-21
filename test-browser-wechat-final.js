#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const browserFetcher = require('./lib/browser-fetcher');

async function testWeChat() {
  console.log('🧪 Testing Final Browser-based WeChat Fetcher');
  const url = 'https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw';
  console.log('🔗 URL:', url);
  
  try {
    const result = await browserFetcher.fetch(url);
    
    if (result.success) {
      console.log('✅ Browser fetch successful!');
      console.log('Status:', result.status);
      console.log('Content length:', result.html.length);
      
      // 检查是否为真实内容
      const lowerHtml = result.html.toLowerCase();
      if (lowerHtml.includes('环境异常') || lowerHtml.includes('完成验证')) {
        console.log('⚠️ Still getting verification page');
        console.log('📝 Content preview:', result.html.substring(0, 200) + '...');
      } else {
        console.log('🎉 SUCCESS: Got real article content!');
        // 提取标题
        const titleMatch = result.html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          console.log('Title:', titleMatch[1]);
        }
        console.log('📝 Content preview:', result.html.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ Browser fetch failed:', result.error);
    }
  } catch (error) {
    console.log('💥 Test error:', error.message);
  }
}

testWeChat().catch(console.error);