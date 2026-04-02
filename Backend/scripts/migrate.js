#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Read migration SQL file
    const migrationSql = fs.readFileSync(path.join(__dirname, '..', 'db', 'migration.sql'), 'utf8');
    
    // Split into individual statements and execute
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
      } catch (err) {
        console.warn(`⚠️  Warning: ${err.message}`);
      }
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
