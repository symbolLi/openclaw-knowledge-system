#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const settings = require('./config/settings');
const { initDatabase } = require('./lib/database');
const { fetchWebpage } = require('./lib/web-fetcher');

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
    
    // 获取URL参数（简化版本，实际会从命令行参数获取）
    const url = process.argv[4] || 'https://example.com';
    
    console.log(`🔍 Fetching: ${url}`);
    
    // 抓取网页内容
    const content = await fetchWebpage(url);
    
    console.log('✅ Content fetched successfully!');
    console.log(`Title: ${content.title}`);
    console.log(`Content length: ${content.content.length} characters`);
    
    // TODO: 集成AI处理、存储等后续步骤
    
  } catch (error) {
    console.error('❌ Article processing failed:', error.message);
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.log('💡 Tip: The article cannot be auto-fetched. Please save it manually and reply "已保存" to continue processing.');
    }
    process.exit(1);
  }
}

main().catch(console.error);