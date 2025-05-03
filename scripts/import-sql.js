#!/usr/bin/env node

/**
 * SQL-Based User Import Tool
 * This script uses SQL directly for faster bulk imports
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
const BATCH_SIZE = 100; // Process users in batches of this size
const START_OFFSET = 0; // Start from the beginning of the CSV to find any missed users
const MAX_USERS = 5000; // Maximum users to import (more than we need)

// Password hashing function - matches auth.ts implementation
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Create a buffer for scrypt hash (64 bytes)
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

// Generate username from phone number
function generateUsernameFromPhone(phone) {
  const lastDigits = phone.slice(-6);
  return `user_${lastDigits}`;
}

async function main() {
  console.log("======================================");
  console.log("  SQL-BASED BULK IMPORT TOOL         ");
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
    
    // Get records to process
    const recordsToProcess = allRecords.slice(START_OFFSET, START_OFFSET + MAX_USERS);
    console.log(`Will attempt to import ${recordsToProcess.length} records (from offset ${START_OFFSET})`);
    
    // Filter out duplicate phone numbers
    const newRecords = recordsToProcess.filter(record => !existingPhones.has(record.Phone));
    console.log(`Found ${newRecords.length} new records to import (filtered out ${recordsToProcess.length - newRecords.length} duplicates)`);
    
    if (newRecords.length === 0) {
      console.log('No new users to import. Exiting.');
      return;
    }
    
    // Hash a standard password once for all users
    const standardPassword = await hashPassword('password');
    
    // Process records in batches
    let totalImported = 0;
    const batches = [];
    
    // Split records into batches
    for (let i = 0; i < newRecords.length; i += BATCH_SIZE) {
      const batch = newRecords.slice(i, i + BATCH_SIZE);
      batches.push(batch);
    }
    
    console.log(`Split import into ${batches.length} batches of ${BATCH_SIZE} users each`);
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\nProcessing batch ${batchIndex + 1} of ${batches.length} (${batch.length} users)`);
      
      try {
        // Begin transaction for this batch
        await client.query('BEGIN');
        
        // Prepare values for batch insert
        const valuesClauses = [];
        const values = [];
        let paramCounter = 1;
        
        for (const record of batch) {
          const phone = record.Phone;
          const username = generateUsernameFromPhone(phone) + "_" + Math.floor(Math.random() * 1000);
          const fullName = record.Username || username;
          const email = `${phone}@example.com`;
          
          // All users start with zero balance
          const balance = JSON.stringify({ 
            INR: 0, 
            BTC: 0, 
            ETH: 0, 
            USDT: 0 
          });
          
          const createdAt = new Date().toISOString();
          const isAdmin = false;
          const isBanned = false;
          
          // Add parameters
          valuesClauses.push(`($${paramCounter}, $${paramCounter + 1}, $${paramCounter + 2}, $${paramCounter + 3}, $${paramCounter + 4}, $${paramCounter + 5}, $${paramCounter + 6}, $${paramCounter + 7}, $${paramCounter + 8})`);
          
          values.push(
            username,
            fullName,
            phone,
            standardPassword,
            email,
            balance,
            createdAt,
            isAdmin,
            isBanned
          );
          
          paramCounter += 9;
        }
        
        // Execute batch insert
        const query = `
          INSERT INTO users (username, full_name, phone, password, email, balance, created_at, is_admin, is_banned)
          VALUES ${valuesClauses.join(', ')}
        `;
        
        const result = await client.query(query, values);
        await client.query('COMMIT');
        
        totalImported += result.rowCount;
        console.log(`Batch ${batchIndex + 1} committed: ${result.rowCount} users imported`);
        
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error in batch ${batchIndex + 1}:`, err.message);
      }
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
    console.log(`Expected additions:     ${totalImported}`);
    console.log("======================================");
    
    if (finalCount > initialCount) {
      console.log("\nImport successful! You can now run the referral code generator.");
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