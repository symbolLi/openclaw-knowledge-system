#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const aiClient = require('./lib/ai-client');

async function testAIIntegration() {
  console.log('🧪 Testing AI Integration (Stage 2b)');
  
  // 测试内容
  const testContent = `
    JavaScript 是一种高级编程语言，广泛用于Web开发。它最初由Netscape的Brendan Eich在1995年创建。
    JavaScript 现在是Web开发的三大核心技术之一（HTML、CSS、JavaScript）。
    
    现代JavaScript支持函数式编程、面向对象编程等多种编程范式。ES6（ECMAScript 2015）引入了许多新特性，
    如箭头函数、模板字符串、解构赋值、Promise、模块等，大大改善了开发体验。
    
    Node.js 的出现使得JavaScript可以运行在服务器端，进一步扩展了JavaScript的应用范围。
    现在JavaScript生态系统非常丰富，有React、Vue、Angular等前端框架，以及Express、Koa等后端框架。
    
    JavaScript的发展仍在继续，每年都会发布新的ECMAScript标准，为开发者带来更多便利和功能。
  `;
  
  const testTitle = 'JavaScript 发展历程与现代应用';
  
  try {
    console.log('🔍 Processing content with AI...');
    const result = await aiClient.processContent(testContent, testTitle);
    console.log('✅ AI Processing Successful!');
    console.log('📊 Results:');
    console.log(`   分类: ${result.category}`);
    console.log(`   摘要: ${result.summary}`);
    console.log(`   关键词: ${result.keywords}`);
  } catch (error) {
    console.error('❌ AI Processing Failed:', error.message);
    process.exit(1);
  }
}

testAIIntegration().catch(console.error);