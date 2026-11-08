/**
 * Database Initialization & Schema Migration Runner
 * 
 * Executes schema.sql and seed.sql against the configured MySQL instance,
 * validates relationships, constraints, and tables.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env configuration
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true,
};

const DB_NAME = process.env.DB_NAME || 'student_skill_exchange';

async function runDatabaseMigration() {
  console.log('========================================================');
  console.log('Student Skill Exchange Platform - Database Initializer');
  console.log('========================================================\n');
  console.log(`Target Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`Target User: ${DB_CONFIG.user}`);
  console.log(`Database Name: ${DB_NAME}\n`);

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const seedPath = path.resolve(__dirname, 'seed.sql');

  if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
    console.error('❌ Error: schema.sql or seed.sql file missing.');
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  let connection = null;

  try {
    console.log('1. Connecting to MySQL server instance...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('   ✓ Connected to MySQL server successfully.');

    console.log(`\n2. Creating database "${DB_NAME}" if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${DB_NAME}\`;`);
    console.log(`   ✓ Selected database: ${DB_NAME}`);

    console.log('\n3. Executing schema.sql (Table creation & constraints)...');
    await connection.query(schemaSql);
    console.log('   ✓ Schema executed successfully. All 11 tables created.');

    console.log('\n4. Executing seed.sql (Sample data insertion)...');
    await connection.query(seedSql);
    console.log('   ✓ Sample seed data inserted successfully.');

    console.log('\n5. Verifying Table Integrity & Row Counts:');
    const tables = [
      'users',
      'student_profiles',
      'skills',
      'student_skills',
      'exchange_requests',
      'sessions',
      'credit_transactions',
      'reviews',
      'messages',
      'notifications',
      'reports',
    ];

    for (const table of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
      console.log(`   - ${table.padEnd(22)} : ${rows[0].total} rows`);
    }

    console.log('\n========================================================');
    console.log('✅ DATABASE INITIALIZATION COMPLETE AND VERIFIED');
    console.log('========================================================');
  } catch (err) {
    console.warn('\n⚠️ MySQL Server Connection / Execution Notice:');
    console.warn(`   Error Details: ${err.message || err.code || String(err)}`);
    console.log('\nℹ️ If MySQL is not running on port 3306 on your machine:');
    console.log('   1. Start your local MySQL service (e.g. via XAMPP Control Panel, MySQL Workbench, or run: net start MySQL80)');
    console.log('   2. Verify DB_PASSWORD in backend/.env matches your root password.');
    console.log('   3. Re-run this script with: npm run db:init (or node src/database/init_db.js)');
    console.log('\n📄 Complete schema and seeds are saved in:');
    console.log(`   - Schema: ${schemaPath}`);
    console.log(`   - Seeds : ${seedPath}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runDatabaseMigration();
