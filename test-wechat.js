#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const settings = require('./config/settings');
const { initDatabase } = require('./lib/database');
const { fetchWebpage } = require('./lib/web-fetcher');
const contentExtractor = require('./lib/content-extractor');
const aiClient = require('./lib/ai-client');

async function testWechatArticle() {
  try {
    console.log('🧪 Testing WeChat Article Processing');
    console.log('🔗 URL: https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw');
    
    // 初始化数据库
    const db = await initDatabase();
    
    const url = 'https://mp.weixin.qq.com/s/h0iv3wJzjCsfEZsxNsXcHw';
    
    console.log(`🔍 Fetching: ${url}`);
    
    // 抓取网页内容
    const fetchResult = await fetchWebpage(url);
    
    if (!fetchResult.success) {
      console.error('❌ Fetch failed:', fetchResult.error);
      return;
    }
    
    console.log('✅ Content fetched successfully!');
    console.log(`Status: ${fetchResult.status}`);
    console.log(`Final URL: ${fetchResult.url}`);
    
    // 提取结构化内容
    const extractedContent = contentExtractor.extract(fetchResult.html, url);
    console.log(`\n📄 Extracted Content:`);
    console.log(`Title: ${extractedContent.title}`);
    console.log(`Content length: ${extractedContent.content.length} characters`);
    console.log(`Published At: ${extractedContent.publishedAt}`);
    console.log(`Images found: ${extractedContent.images.length}`);
    
    // 显示前200字符的内容预览
    console.log(`\n📝 Content Preview:`);
    console.log(extractedContent.content.substring(0, 200) + '...');
    
    // AI智能处理
    console.log('\n🤖 Processing with AI...');
    const aiResult = await aiClient.processContent(extractedContent.content, extractedContent.title);
    
    console.log('\n✅ AI processing completed!');
    console.log(`📊 Final Results:`);
    console.log(`   分类: ${aiResult.category}`);
    console.log(`   摘要: ${aiResult.summary}`);
    console.log(`   关键词: ${aiResult.keywords}`);
    
    // 关闭数据库连接
    db.close();
    
  } catch (error) {
    console.error('❌ Article processing failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testWechatArticle().catch(console.error);