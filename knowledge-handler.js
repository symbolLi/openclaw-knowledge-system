#!/usr/bin/env node

/**
 * OpenClaw Knowledge System - Main Entry Point
 * Version: v0.0.1
 * 
 * This is the main entry point for all knowledge system operations.
 * It handles command line arguments and routes to appropriate handlers.
 */

const { DATABASE_PATH, DATA_DIR } = require('./config/settings');
const { initializeDatabase } = require('./lib/database');

async function main() {
  try {
    // Initialize database if not exists
    await initializeDatabase();
    
    // For phase 1, just return a simple message
    console.log(JSON.stringify({
      type: 'message',
      content: '✅ OpenClaw Knowledge System v0.0.1 - Base architecture ready!'
    }));
    
  } catch (error) {
    console.error(JSON.stringify({
      type: 'error',
      message: `❌ Initialization failed: ${error.message}`
    }));
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };