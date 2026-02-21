#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initDatabase } = require('./lib/database');
const { fetchWebpage } = require('./lib/web-fetcher');
const contentExtractor = require('./lib/content-extractor');
const aiClient = require('./lib/ai-client');

async function testZhihuArticle() {
  console.log('🧪 Testing Zhihu Article Processing');
  const url = 'https://www.zhihu.com/question/2008253352463528326/answer/2008271534163240685?share_code=JtnuyjoyfDIN&utm_psn=2008514245822797359';
  console.log('🔗 URL:', url);
  
  try {
    // 初始化数据库
    const db = await initDatabase();
    
    // 抓取网页内容
    console.log('🔍 Fetching:', url);
    const fetchResult = await fetchWebpage(url);
    
    if (!fetchResult.success) {
      console.log('❌ Fetch failed:', fetchResult.error);
      return;
    }
    
    console.log('✅ Content fetched successfully!');
    console.log('Status:', fetchResult.status);
    console.log('Final URL:', fetchResult.url);
    
    // 提取结构化内容
    const extractedContent = contentExtractor.extract(fetchResult.html, url);
    console.log('\n📄 Extracted Content:');
    console.log('Title:', extractedContent.title || '(no title)');
    console.log('Content length:', extractedContent.content.length, 'characters');
    console.log('Published At:', extractedContent.publishedAt);
    console.log('Images found:', extractedContent.images.length);
    
    // 显示内容预览
    const preview = extractedContent.content.substring(0, 200).replace(/\n/g, ' ');
    console.log('\n📝 Content Preview:');
    console.log(preview + (extractedContent.content.length > 200 ? '...' : ''));
    
    // AI智能处理
    console.log('\n🤖 Processing with AI...');
    const aiResult = await aiClient.processContent(extractedContent.content, extractedContent.title);
    
    console.log('\n✅ AI processing completed!');
    console.log('📊 Final Results:');
    console.log('   分类:', aiResult.category);
    console.log('   摘要:', aiResult.summary);
    console.log('   关键词:', aiResult.keywords);
    
    // 关闭数据库
    db.close();
    
  } catch (error) {
    console.error('❌ Processing failed:', error.message);
    process.exit(1);
  }
}

testZhihuArticle().catch(console.error);