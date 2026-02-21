#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const settings = require('./config/settings');
const KnowledgeDatabase = require('./lib/database');

async function testDatabase() {
  try {
    console.log('🧪 Testing Database Connection (Stage 1)');
    
    // 初始化数据库
    const db = new KnowledgeDatabase(settings.dbPath);
    
    // 等待一小段时间让数据库初始化完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试连接
    const testResult = await db.testConnection();
    console.log('✅ Database connection successful!');
    console.log('Test result:', testResult);
    
    // 关闭数据库
    db.close();
    console.log('✅ Database closed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabase().catch(console.error);