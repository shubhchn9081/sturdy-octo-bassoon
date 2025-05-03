#!/usr/bin/env node

/**
 * Quick Import Tool - Imports a limited number of users for testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load database connection from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuration
const CSV_PATH = path.join(__dirname, '../attached_assets/users - Sheet1.csv');
const LIMIT = 50; // Only import this many users for testing

// Password hashing function
function hashPassword(password) {
  const salt = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
  const hashedPassword = crypto.createHash('sha512')
    .update(password + salt)
    .digest('hex');
  return `${hashedPassword}.${salt}`;
}

// Generate username from phone number
function generateUsernameFromPhone(phone) {
  const lastDigits = phone.slice(-6);
  return `user_${lastDigits}`;
}

async function main() {
  console.log("======================================");
  console.log("  QUICK IMPORT TOOL (TEST MODE)      ");
  console.log("======================================");
  
  const client = await pool.connect();
  
  try {
    // Get current user count
    const countResult = await client.query('SELECT COUNT(*) FROM users');
    const initialCount = parseInt(countResult.rows[0].count);
    console.log(`\nStarting user count: ${initialCount}`);
    
    // Get existing phones to avoid duplicates
    const existingPhonesResult = await client.query('SELECT phone FROM users');
    const existingPhones = new Set(existingPhonesResult.rows.map(row => row.phone));
    console.log(`Found ${existingPhones.size} existing phone numbers`);
    
    // Read CSV file
    console.log(`\nReading CSV file from ${CSV_PATH}`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const allRecords = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV file contains ${allRecords.length} records`);
    
    // Take records from the middle of the CSV to find non-duplicates
    const records = allRecords.slice(200, 200 + LIMIT);
    console.log(`Will attempt to import ${records.length} records (limited for testing from offset 200)`);
    
    // Hash a standard password once for all users
    const standardPassword = hashPassword('password');
    
    // Process records
    let importedCount = 0;
    let skippedCount = 0;
    
    // Begin a single transaction
    await client.query('BEGIN');
    
    try {
      for (const record of records) {
        const phone = record.Phone;
        
        // Skip if already exists
        if (existingPhones.has(phone)) {
          console.log(`Skipping existing phone: ${phone}`);
          skippedCount++;
          continue;
        }
        
        // Generate a unique username
        const username = generateUsernameFromPhone(phone) + "_" + Math.floor(Math.random() * 1000);
        
        // Insert user
        await client.query(`
          INSERT INTO users (
            username, full_name, phone, password, 
            email, balance, created_at, 
            is_admin, is_banned
          ) VALUES (
            $1, $2, $3, $4, 
            $5, $6, $7, 
            $8, $9
          )
        `, [
          username,
          record.Username || username,
          phone,
          standardPassword,
          `${phone}@example.com`,
          JSON.stringify({ INR: 0, BTC: 0, ETH: 0, USDT: 0 }), // Zero balance
          new Date(),
          false, // Not admin
          false  // Not banned
        ]);
        
        // Add to tracking set
        existingPhones.add(phone);
        importedCount++;
        
        console.log(`Imported user with phone: ${phone}`);
      }
      
      // Commit all changes
      await client.query('COMMIT');
      console.log(`\nCommitted ${importedCount} new users to database`);
      
    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('Transaction error:', err.message);
    }
    
    // Get final count
    const finalCountResult = await client.query('SELECT COUNT(*) FROM users');
    const finalCount = parseInt(finalCountResult.rows[0].count);
    
    // Print summary
    console.log("\n======================================");
    console.log("  IMPORT SUMMARY                     ");
    console.log("======================================");
    console.log(`Initial user count:     ${initialCount}`);
    console.log(`Final user count:       ${finalCount}`);
    console.log(`Users added:            ${finalCount - initialCount}`);
    console.log(`Skipped users:          ${skippedCount}`);
    console.log("======================================");
    
    if (finalCount > initialCount) {
      console.log("\nTest import successful! You can now try importing more users.");
    }
    
  } catch (err) {
    console.error('Error in import process:', err.message);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the import function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});