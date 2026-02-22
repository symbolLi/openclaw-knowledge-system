#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const settings = require('./config/settings');
const { initDatabase } = require('./lib/database');
const { fetchWebpage } = require('./lib/web-fetcher');
const contentExtractor = require('./lib/content-extractor');
const aiClient = require('./lib/ai-client');

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      console.log('✅ OpenClaw Knowledge System - Stage 1 & 2a Ready!');
      break;
      
    case 'article':
      await handleArticle();
      break;
      
    default:
      console.log('Usage: knowledge-handler.js [test|article]');
      process.exit(1);
  }
}

async function handleArticle() {
  try {
    // 初始化数据库
    const db = await initDatabase();
    
    // 获取URL参数
    const url = process.argv[4] || 'https://example.com';
    
    console.log(`🔍 Fetching: ${url}`);
    
    // 抓取网页内容
    const fetchResult = await fetchWebpage(url);
    
    if (!fetchResult.success) {
      throw new Error(fetchResult.error);
    }
    
    console t.log('✅ Content fetched successfully!');
    
    // 提取结构化内容
    const extractedContent = contentExtractor.extract(fetchResult.html, url);
    console.log(`Title: ${extractedContent.title}`);
    console.log(`Content length: ${extractedContent.content.length} characters`);
    
    // AI智能处理
    console.log('🤖 Processing with AI...');
    const aiResult = await aiClient.processContent(extractedContent.content, extractedContent.title);
    
    console.log('✅ AI processing completed!');
    console.log(`Category: ${aiResult.category}`);
    console.log(`Summary: ${aiResult.summary}`);
    console.log(`Keywords: ${aiResult.keywords}`);
    
    // 关闭数据库连接
    db.close();
    
  } catch (error) {
    console.error('❌ Article processing failed:', error.message);
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.log('💡 Tip: The article cannot be auto-fetched. Please save it manually and reply "已保存" to continue processing.');
    }
    process.exit(1);
  }
}

main().catch(console.error);