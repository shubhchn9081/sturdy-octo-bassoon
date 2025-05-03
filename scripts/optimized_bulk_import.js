#!/usr/bin/env node

/**
 * Optimized bulk import script for importing users with zero balance
 * Uses direct SQL commands and efficient batching for maximum performance
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
const MAX_BATCH_SIZE = 100; // How many records to process in a single SQL query
const ZERO_BALANCE = JSON.stringify({ INR: 0, BTC: 0, ETH: 0, USDT: 0 });

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
    console.log("Starting optimized bulk import process...");
    
    // Get initial count for reference
    const countResult = await client.query('SELECT COUNT(*) FROM users');
    const initialCount = parseInt(countResult.rows[0].count);
    console.log(`Initial user count: ${initialCount}`);
    
    // Create a temporary table to store existing phone numbers for efficient lookups
    await client.query(`
      CREATE TEMP TABLE existing_phones (
        phone TEXT PRIMARY KEY
      )
    `);
    
    // Populate the temporary table with existing phone numbers
    await client.query(`
      INSERT INTO existing_phones (phone)
      SELECT phone FROM users
    `);
    
    console.log("Created temporary table for phone number lookups");
    
    // Read and parse CSV data
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV has ${records.length} total rows`);
    
    // Generate a single password hash for all imported users
    const singlePassword = hashPassword('password');
    console.log("Generated password hash for all users");
    
    // Create a temporary table for bulk insert
    await client.query(`
      CREATE TEMP TABLE temp_users (
        username TEXT UNIQUE,
        full_name TEXT,
        phone TEXT UNIQUE,
        password TEXT,
        balance JSONB,
        created_at TIMESTAMP,
        email TEXT UNIQUE,
        is_admin BOOLEAN,
        is_banned BOOLEAN
      )
    `);
    
    console.log("Created temporary table for bulk insert");
    
    // Process users in batches to avoid memory issues
    let recordsToProcess = [];
    let skippedCount = 0;
    let processedCount = 0;
    let successCount = 0;
    
    // First pass - filter out records with existing phones
    for (const record of records) {
      const phone = record.Phone;
      if (!phone) {
        skippedCount++;
        continue;
      }
      
      // Check if this phone exists in our temporary table
      const existsResult = await client.query(
        'SELECT 1 FROM existing_phones WHERE phone = $1', 
        [phone]
      );
      
      if (existsResult.rows.length > 0) {
        skippedCount++;
        continue;
      }
      
      // Add to records to process
      let username = generateUsernameFromPhone(phone);
      
      // Add some randomness to ensure uniqueness
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      username = `${username}_${randomSuffix}`;
      
      // Add to batch
      recordsToProcess.push({
        username,
        fullName: record.Username || username,
        phone,
        email: `${phone}@example.com`
      });
      
      // Add to the temporary table to avoid duplicates in future iterations
      await client.query('INSERT INTO existing_phones (phone) VALUES ($1)', [phone]);
    }
    
    console.log(`Found ${recordsToProcess.length} users to import`);
    console.log(`Skipping ${skippedCount} users with duplicate phones or missing data`);
    
    // Process in batches
    const batches = [];
    for (let i = 0; i < recordsToProcess.length; i += MAX_BATCH_SIZE) {
      batches.push(recordsToProcess.slice(i, i + MAX_BATCH_SIZE));
    }
    
    console.log(`Divided into ${batches.length} batches of up to ${MAX_BATCH_SIZE} users each`);
    
    // Process each batch with its own transaction
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length} (${batch.length} users)`);
      
      // Begin transaction for this batch
      await client.query('BEGIN');
      
      try {
        // Insert into temporary table first (faster than inserting directly)
        for (const record of batch) {
          await client.query(`
            INSERT INTO temp_users (
              username, full_name, phone, password, 
              balance, created_at, email, 
              is_admin, is_banned
            ) VALUES (
              $1, $2, $3, $4, 
              $5, $6, $7, 
              $8, $9
            )
          `, [
            record.username,
            record.fullName,
            record.phone,
            singlePassword, 
            ZERO_BALANCE,
            new Date(),
            record.email,
            false,
            false
          ]);
          processedCount++;
        }
        
        // Insert from temp table to users table
        const result = await client.query(`
          INSERT INTO users (
            username, full_name, phone, password, 
            balance, created_at, email, 
            is_admin, is_banned
          )
          SELECT 
            username, full_name, phone, password, 
            balance, created_at, email, 
            is_admin, is_banned
          FROM temp_users
          ON CONFLICT DO NOTHING
        `);
        
        successCount += result.rowCount;
        console.log(`Inserted ${result.rowCount} users from batch ${batchIndex + 1}`);
        
        // Clear temp table for next batch
        await client.query('TRUNCATE TABLE temp_users');
        
        // Commit transaction for this batch
        await client.query('COMMIT');
      } catch (err) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error(`Error processing batch ${batchIndex + 1}:`, err.message);
      }
    }
    
    // Get final count
    const finalCountResult = await client.query('SELECT COUNT(*) FROM users');
    const finalCount = parseInt(finalCountResult.rows[0].count);
    
    console.log("\nImport Summary:");
    console.log(`Starting count: ${initialCount}`);
    console.log(`Final count: ${finalCount}`);
    console.log(`New users added: ${finalCount - initialCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Processed: ${processedCount}`);
    console.log(`Successfully inserted: ${successCount}`);
    
  } catch (err) {
    console.error('Error in main process:', err.message);
  } finally {
    // Drop temporary tables
    try {
      await client.query('DROP TABLE IF EXISTS existing_phones');
      await client.query('DROP TABLE IF EXISTS temp_users');
    } catch (err) {
      console.error('Error dropping temporary tables:', err.message);
    }
    
    // Release client
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});