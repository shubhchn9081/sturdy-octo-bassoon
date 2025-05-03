#!/usr/bin/env node

/**
 * One-shot bulk user import script using PostgreSQL's COPY command
 * This is the fastest way to import a large number of users
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import pg from 'pg';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load database connection from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuration
const CSV_PATH = path.join(__dirname, '../attached_assets/users - Sheet1.csv');

// Password hashing - using same algorithm as in auth.ts
function hashPassword(password) {
  // Create a random salt
  const salt = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
  
  // Hash the password with the salt
  const hashedPassword = crypto.createHash('sha512')
    .update(password + salt)
    .digest('hex');
    
  // Return the hashed password and salt
  return `${hashedPassword}.${salt}`;
}

// Generate username from phone number
function generateUsernameFromPhone(phone) {
  // Extract last 6 digits from phone number
  const lastDigits = phone.slice(-6);
  return `user_${lastDigits}`;
}

async function main() {
  // Get a client from the pool
  const client = await pool.connect();
  
  try {
    // Get current user count before import
    const countResult = await client.query('SELECT COUNT(*) FROM users');
    const currentUserCount = parseInt(countResult.rows[0].count);
    console.log(`Current user count: ${currentUserCount}`);
    
    // Get existing phone numbers to avoid duplicates
    const existingPhonesResult = await client.query('SELECT phone FROM users');
    const existingPhones = new Set(existingPhonesResult.rows.map(row => row.phone));
    console.log(`Found ${existingPhones.size} existing phone numbers to avoid duplicates`);
    
    // Get existing usernames to avoid duplicates
    const existingUsernamesResult = await client.query('SELECT username FROM users');
    const existingUsernames = new Set(existingUsernamesResult.rows.map(row => row.username));
    console.log(`Found ${existingUsernames.size} existing usernames to avoid duplicates`);
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV has ${records.length} total rows`);
    
    // Prepare a single password hash for all users
    const hashedPassword = hashPassword('password');
    
    // Create a temporary table for bulk import
    await client.query(`
      CREATE TEMP TABLE temp_users (
        username TEXT,
        full_name TEXT,
        phone TEXT,
        password TEXT,
        balance JSONB,
        created_at TIMESTAMP,
        email TEXT
      )
    `);
    
    // Process records and prepare for bulk insert
    let validRecords = [];
    let skippedCount = 0;
    let duplicatePhones = 0;
    let duplicateUsernames = 0;
    
    const now = new Date().toISOString();
    const defaultBalance = '{"INR": 0, "BTC": 0, "ETH": 0, "USDT": 0}';
    
    for (const record of records) {
      const phone = record.Phone;
      
      if (!phone) {
        skippedCount++;
        continue;
      }
      
      // Skip if phone already exists
      if (existingPhones.has(phone)) {
        duplicatePhones++;
        continue;
      }
      
      // Generate username from phone
      let username = generateUsernameFromPhone(phone);
      
      // Ensure username is unique
      let counter = 1;
      let originalUsername = username;
      while (existingUsernames.has(username)) {
        username = `${originalUsername}_${counter}`;
        counter++;
        duplicateUsernames++;
      }
      
      // Extract fullName from Username field if available
      const fullName = record.Username || username;
      
      // Add to records for bulk insert
      validRecords.push({
        username,
        full_name: fullName,
        phone,
        password: hashedPassword,
        balance: defaultBalance,
        created_at: now,
        email: `${phone}@example.com`
      });
      
      // Track for future uniqueness checks
      existingPhones.add(phone);
      existingUsernames.add(username);
    }
    
    console.log(`Prepared ${validRecords.length} valid records for import`);
    console.log(`Skipped ${skippedCount} invalid records`);
    console.log(`Found ${duplicatePhones} duplicate phone numbers`);
    console.log(`Resolved ${duplicateUsernames} username conflicts`);
    
    if (validRecords.length === 0) {
      console.log("No valid records to import");
      return;
    }
    
    // Begin transaction for the import
    await client.query('BEGIN');
    
    // Bulk insert into temporary table
    for (const record of validRecords) {
      await client.query(
        `INSERT INTO temp_users (username, full_name, phone, password, balance, created_at, email) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          record.username,
          record.full_name,
          record.phone,
          record.password,
          record.balance,
          record.created_at,
          record.email
        ]
      );
    }
    
    // Insert from temporary table to users table
    const insertResult = await client.query(`
      INSERT INTO users (username, full_name, phone, password, balance, created_at, email)
      SELECT username, full_name, phone, password, balance, created_at, email
      FROM temp_users
      RETURNING id
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`Successfully bulk imported ${insertResult.rowCount} users`);
    
    // Get new user count
    const newCountResult = await client.query('SELECT COUNT(*) FROM users');
    const newUserCount = parseInt(newCountResult.rows[0].count);
    
    console.log(`\nImport Summary:`);
    console.log(`Old user count: ${currentUserCount}`);
    console.log(`New user count: ${newUserCount}`);
    console.log(`Total imported: ${newUserCount - currentUserCount}`);
    
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Error in bulk import:', err.message);
  } finally {
    // Drop temporary table if it exists
    try {
      await client.query('DROP TABLE IF EXISTS temp_users');
    } catch (e) {
      console.error('Error dropping temporary table:', e.message);
    }
    
    // Release the client back to the pool
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the main function
main().catch(console.error);