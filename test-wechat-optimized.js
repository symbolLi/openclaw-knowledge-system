#!/usr/bin/env node

const webFetcher = require('./lib/web-fetcher');
const contentExtractor = require('./lib/content-extractor');
const aiClient = require('./lib/ai-client');

async function testWeChatOptimized() {
  console.log('🧪 Testing Optimized WeChat Fetcher (UA Pool + Retry)');
  const url = 'https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw';
  console.log(`🔗 URL: ${url}`);
  
  try {
    // 抓取网页内容
    console.log('🔍 Attempting to fetch with optimized strategy...');
    const fetchResult = await webFetcher.fetchWebpage(url);
    
    if (!fetchResult.success) {
      console.log(`❌ Fetch failed: ${fetchResult.error}`);
      return;
    }
    
    console.log('✅ Content fetched successfully!');
    console.log(`Status: ${fetchResult.status}`);
    console.log(`Content length: ${fetchResult.html.length} characters`);
    
    // 检查是否仍是验证页面
    const lowerHtml = fetchResult.html.toLowerCase();
    const isVerification = lowerHtml.includes('环境异常') || 
                          lowerHtml.includes('完成验证后即可继续访问') ||
                          lowerHtml.includes('去验证');
    
    if (isVerification) {
      console.log('⚠️ Still getting verification page, but this is expected for some cases');
      console.log('📝 Content preview:');
      console.log(fetchResult.html.substring(0, 200) + '...');
    } else {
      console.log('🎉 Successfully bypassed anti-bot protection!');
      
      // 提取内容
      const extractedContent = contentExtractor.extract(fetchResult.html, url);
      console.log(`Title: ${extractedContent.title}`);
      console.log(`Content length: ${extractedContent.content.length} characters`);
      
      // AI处理
      console.log('🤖 Processing with AI...');
      const aiResult = await aiClient.processContent(extractedContent.content, extractedContent.title);
      
      console.log('✅ AI processing completed!');
      console.log(`📊 Final Results:`);
      console.log(`   分类: ${aiResult.category}`);
      console.log(`   摘要: ${aiResult.summary}`);
      console.log(`   关键词: ${aiResult.keywords}`);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

testWeChatOptimized();