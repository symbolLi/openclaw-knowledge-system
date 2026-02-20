const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

class KnowledgeDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    // 确保数据库目录存在
    const dbDir = path.dirname(dbPath);
    fs.mkdir(dbDir, { recursive: true }).catch(console.error);
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err.message);
      } else {
        console.log('Connected to knowledge database');
        this.initSchema();
      }
    });
  }

  initSchema() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY,
        type TEXT NOT NULL,
        url TEXT,
        title TEXT NOT NULL,
        summary TEXT,
        category TEXT NOT NULL,
        keywords TEXT,
        content_path TEXT,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Table creation error:', err.message);
      } else {
        console.log('Articles table initialized');
      }
    });
  }

  // 测试连接
  async testConnection() {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT 1 as test', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = KnowledgeDatabase;