#!/usr/bin/env node

/**
 * Improved bulk user import script with batch processing
 * Commits after each batch to prevent timeout issues
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
const BATCH_SIZE = 50;  // Process in smaller batches
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
    // Get current user count
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
    
    // Process records in batches
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let currentBatch = [];
    
    for (const record of records) {
      try {
        const phone = record.Phone;
        
        if (!phone) {
          console.log("Skipping record without a phone number");
          skippedCount++;
          continue;
        }
        
        // Skip if phone already exists
        if (existingPhones.has(phone)) {
          // Skip silently to reduce console output
          skippedCount++;
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
        }
        
        // Extract fullName from Username field if available
        const fullName = record.Username || username;
        
        // Add to current batch
        currentBatch.push({
          username,
          fullName,
          phone,
          hashedPassword,
          email: `${phone}@example.com`
        });
        
        // Track for future uniqueness checks
        existingPhones.add(phone);
        existingUsernames.add(username);
        
        // Process batch if it reaches the batch size
        if (currentBatch.length >= BATCH_SIZE) {
          await processBatch(client, currentBatch);
          insertedCount += currentBatch.length;
          console.log(`Progress: ${insertedCount} users inserted so far`);
          currentBatch = [];
        }
      } catch (err) {
        console.error(`Error processing record:`, err.message);
        errorCount++;
      }
    }
    
    // Process any remaining records
    if (currentBatch.length > 0) {
      await processBatch(client, currentBatch);
      insertedCount += currentBatch.length;
    }
    
    // Get new user count
    const newCountResult = await client.query('SELECT COUNT(*) FROM users');
    const newUserCount = parseInt(newCountResult.rows[0].count);
    
    console.log(`\nImport completed!`);
    console.log(`Successfully inserted ${insertedCount} users`);
    console.log(`Skipped ${skippedCount} users (already existed or invalid data)`);
    console.log(`Encountered ${errorCount} errors`);
    console.log(`Old user count: ${currentUserCount}`);
    console.log(`New user count: ${newUserCount}`);
    console.log(`Difference: ${newUserCount - currentUserCount}`);
    
  } catch (err) {
    console.error('Error in main process:', err.message);
  } finally {
    // Release the client back to the pool
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

// Process a batch of users with a transaction
async function processBatch(client, userBatch) {
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Insert each user in the batch
    for (const user of userBatch) {
      await client.query(
        'INSERT INTO users (username, full_name, phone, password, balance, created_at, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          user.username, 
          user.fullName, 
          user.phone, 
          user.hashedPassword, 
          '{"INR": 0, "BTC": 0, "ETH": 0, "USDT": 0}', 
          new Date(), 
          user.email
        ]
      );
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    return true;
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Transaction error:', err.message);
    return false;
  }
}

// Run the main function
main().catch(console.error);