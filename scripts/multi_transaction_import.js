#!/usr/bin/env node

/**
 * Multi-transaction user import script
 * Processes data in smaller batches with independent transactions
 * to ensure the import completes without timeouts
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
const BATCH_SIZE = 50; // Process in smaller batches with independent transactions

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
    // Create temporary table with unique phone constraint
    await client.query(`
      CREATE TEMP TABLE unique_phones (
        phone TEXT PRIMARY KEY
      )
    `);

    // Insert existing phones into temp table
    await client.query(`
      INSERT INTO unique_phones (phone)
      SELECT phone FROM users
    `);
    
    // Get current user count before import
    const countResult = await client.query('SELECT COUNT(*) FROM users');
    const currentUserCount = parseInt(countResult.rows[0].count);
    console.log(`Current user count: ${currentUserCount}`);
    
    // Also track existing usernames to avoid conflicts
    const usernamesResult = await client.query('SELECT username FROM users');
    const existingUsernames = new Set(usernamesResult.rows.map(row => row.username));
    console.log(`Found ${existingUsernames.size} existing usernames`);
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV has ${records.length} total rows`);
    
    // Prepare a single password hash for all users
    const hashedPassword = hashPassword('password');
    
    // Process records
    let processedCount = 0;
    let skippedCount = 0;
    let importedCount = 0;
    let errorCount = 0;
    
    // Prepare all valid records for import
    const validRecords = [];
    
    for (const record of records) {
      processedCount++;
      const phone = record.Phone;
      
      if (!phone) {
        skippedCount++;
        continue;
      }
      
      // Check if phone already exists - using a try-catch to handle duplicates
      try {
        // Attempt to insert into our temp unique phone table
        await client.query('INSERT INTO unique_phones (phone) VALUES ($1)', [phone]);
        
        // If we get here, the phone is unique
        // Generate username from phone
        let username = generateUsernameFromPhone(phone);
        
        // Ensure username is unique
        let counter = 1;
        let originalUsername = username;
        while (existingUsernames.has(username)) {
          username = `${originalUsername}_${counter}`;
          counter++;
        }
        
        // Mark username as used
        existingUsernames.add(username);
        
        // Extract fullName from Username field if available
        const fullName = record.Username || username;
        
        // Add to valid records for batch processing
        validRecords.push({
          username,
          fullName,
          phone,
          email: `${phone}@example.com`
        });
      } catch (err) {
        // Phone already exists
        skippedCount++;
      }
    }
    
    console.log(`Found ${validRecords.length} new users to import`);
    console.log(`Will skip ${skippedCount} records (missing phone or already exists)`);
    
    if (validRecords.length === 0) {
      console.log("No new users to import. Exiting.");
      return;
    }
    
    // Process in batches with separate transactions
    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const batch = validRecords.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(validRecords.length/BATCH_SIZE)} (${batch.length} users)`);
      
      try {
        // Begin transaction for this batch
        await client.query('BEGIN');
        
        // Process each record in the batch
        for (const record of batch) {
          try {
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
              record.username,
              record.fullName,
              record.phone,
              hashedPassword,
              record.email,
              '{"INR": 0, "BTC": 0, "ETH": 0, "USDT": 0}',
              new Date(),
              false,
              false
            ]);
            
            importedCount++;
          } catch (err) {
            console.error(`Error inserting user with phone ${record.phone}:`, err.message);
            errorCount++;
          }
        }
        
        // Commit this batch
        await client.query('COMMIT');
        console.log(`Successfully committed batch with ${batch.length} users`);
      } catch (err) {
        // If the transaction fails, roll it back and continue with the next batch
        await client.query('ROLLBACK');
        console.error(`Error processing batch:`, err.message);
      }
    }
    
    // Get new user count
    const newCountResult = await client.query('SELECT COUNT(*) FROM users');
    const newUserCount = parseInt(newCountResult.rows[0].count);
    
    console.log(`\nImport Summary:`);
    console.log(`Old user count: ${currentUserCount}`);
    console.log(`New user count: ${newUserCount}`);
    console.log(`Total imported: ${newUserCount - currentUserCount}`);
    console.log(`Expected to import: ${importedCount}`);
    if (errorCount > 0) console.log(`Errors encountered: ${errorCount}`);
    
  } catch (err) {
    console.error('Error in import process:', err.message);
  } finally {
    // Drop temporary table
    try {
      await client.query('DROP TABLE IF EXISTS unique_phones');
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