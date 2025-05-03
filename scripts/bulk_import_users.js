#!/usr/bin/env node

/**
 * Efficient bulk user import script using Node.js with batch processing
 * and connection pooling to prevent timeouts
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
const BATCH_SIZE = 50;  // Larger batch size than the Python script
const CSV_PATH = path.join(__dirname, '../attached_assets/users - Sheet1.csv');
const START_INDEX = process.env.START_INDEX ? parseInt(process.env.START_INDEX) : 0;
const MAX_USERS = process.env.MAX_USERS ? parseInt(process.env.MAX_USERS) : 
                  process.env.BATCH_COUNT ? parseInt(process.env.BATCH_COUNT) * BATCH_SIZE : 
                  Number.MAX_SAFE_INTEGER;

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

// Function to check if a phone number already exists
async function phoneExists(phone, client) {
  const result = await client.query(
    'SELECT COUNT(*) FROM users WHERE phone = $1',
    [phone]
  );
  return parseInt(result.rows[0].count) > 0;
}

// Function to check if a username already exists
async function usernameExists(username, client) {
  const result = await client.query(
    'SELECT COUNT(*) FROM users WHERE username = $1',
    [username]
  );
  return parseInt(result.rows[0].count) > 0;
}

// Insert a user with a transaction
async function insertUser(userData, client) {
  const { fullName, phone } = userData;
  
  // Check if phone already exists
  if (await phoneExists(phone, client)) {
    console.log(`Skipping duplicate phone: ${phone}`);
    return null;
  }
  
  // Generate username from phone
  let username = generateUsernameFromPhone(phone);
  
  // Ensure username is unique
  let counter = 1;
  let originalUsername = username;
  while (await usernameExists(username, client)) {
    username = `${originalUsername}_${counter}`;
    counter++;
  }
  
  // Use password "password" for all imported users - they can login with any password
  const hashedPassword = hashPassword('password');
  
  // Insert the user
  const insertResult = await client.query(
    'INSERT INTO users (username, fullName, phone, password, balance, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username',
    [username, fullName || username, phone, hashedPassword, 0, new Date(), new Date()]
  );
  
  return insertResult.rows[0];
}

// Process a batch of users
async function processBatch(userDataBatch) {
  // Get a client from the pool
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    const results = [];
    for (const userData of userDataBatch) {
      try {
        // The CSV has "Phone" as the field name (uppercase)
        const phone = userData.Phone;
        
        if (!phone) {
          console.log("Skipping record without a phone number:", userData);
          continue;
        }
        
        // Extract fullName from Username field if available
        const fullName = userData.Username || null;
        
        const result = await insertUser({phone, fullName}, client);
        if (result) {
          results.push(result);
          console.log(`Inserted user: ${result.username} with phone: ${phone}`);
        }
      } catch (err) {
        console.error(`Error inserting user:`, err.message);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    return results;
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('Transaction error:', err.message);
    throw err;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Main function
async function main() {
  try {
    // Get current user count
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const currentUserCount = parseInt(countResult.rows[0].count);
    console.log(`Current user count: ${currentUserCount}`);
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV has ${records.length} total rows`);
    
    // Process in batches from START_INDEX
    const endIndex = Math.min(START_INDEX + MAX_USERS, records.length);
    console.log(`Processing rows ${START_INDEX} to ${endIndex - 1} (${endIndex - START_INDEX} users)`);
    
    // Split the range into batches
    const batches = [];
    for (let i = START_INDEX; i < endIndex; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, endIndex);
      batches.push(records.slice(i, batchEnd));
    }
    
    // Process batches sequentially to avoid overwhelming the database
    let insertedCount = 0;
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i + 1} of ${batches.length}...`);
      const results = await processBatch(batches[i]);
      insertedCount += results.length;
      
      // Small delay between batches to allow other operations
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Get new user count
    const newCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const newUserCount = parseInt(newCountResult.rows[0].count);
    console.log(`Successfully inserted ${insertedCount} users`);
    console.log(`New user count: ${newUserCount}`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the main function
main().catch(console.error);