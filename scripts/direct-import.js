#!/usr/bin/env node

/**
 * User Bulk Import Tool (Node.js version)
 * Handles fast bulk importing of users from CSV with all required features
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
const BATCH_SIZE = 50; // Users to import in each batch

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

// Generate random referral code
function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Validate phone number (basic check for 10 digits)
function isValidPhone(phone) {
  return phone && /^\d{10}$/.test(phone.toString().trim());
}

// Check if a string value represents "Yes"
function isYesValue(value) {
  return value && (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true');
}

async function main() {
  console.log("======================================");
  console.log("  BULK USER IMPORT TOOL (NODE.JS)     ");
  console.log("======================================");
  
  // Create client for database operations
  const client = await pool.connect();
  
  try {
    // Get current user count
    const countResult = await client.query('SELECT COUNT(*) FROM users');
    const initialCount = parseInt(countResult.rows[0].count);
    console.log(`\nStarting user count: ${initialCount}`);
    
    // Create temp table for existing phones
    await client.query(`
      CREATE TEMP TABLE existing_phones (
        phone TEXT PRIMARY KEY
      )
    `);
    
    // Populate temp table with existing phones
    await client.query(`
      INSERT INTO existing_phones (phone)
      SELECT phone FROM users
    `);
    
    console.log("Loaded existing phone numbers to prevent duplicates");
    
    // Read CSV file
    console.log(`\nReading CSV file from ${CSV_PATH}`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV file contains ${records.length} records`);
    
    // Track import statistics
    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    let skippedCount = 0;
    
    // Hash a standard password once for all users
    const standardPassword = hashPassword('password');
    
    // Create batches for processing
    const batches = [];
    let currentBatch = [];
    
    // Process each CSV record and organize into batches
    for (const record of records) {
      const phone = record.Phone;
      
      // Skip records with invalid phones
      if (!isValidPhone(phone)) {
        console.log(`Skipping invalid phone: ${phone}`);
        invalidCount++;
        continue;
      }
      
      // Check if phone exists in our temp table
      const existsResult = await client.query(
        'SELECT 1 FROM existing_phones WHERE phone = $1',
        [phone]
      );
      
      if (existsResult.rows.length > 0) {
        duplicateCount++;
        continue;
      }
      
      // Add to our tracking table to prevent duplicates
      await client.query('INSERT INTO existing_phones (phone) VALUES ($1)', [phone]);
      
      // Prepare record for processing
      // Use provided username or generate from phone
      const username = record.Username ? 
                       record.Username.toString().trim() : 
                       generateUsernameFromPhone(phone);
      
      // Parse admin and banned status
      const isAdmin = isYesValue(record['Is Admin']);
      const isBanned = isYesValue(record['Is Banned']);
      
      // Add to current batch
      currentBatch.push({
        username,
        fullName: username, // Use username as full name if not provided
        phone,
        isAdmin,
        isBanned,
        referralCode: generateReferralCode()
      });
      
      // If batch is full, add to batches and start a new one
      if (currentBatch.length >= BATCH_SIZE) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    }
    
    // Add any remaining records as the last batch
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    console.log(`\nOrganized ${batches.length} batches with up to ${BATCH_SIZE} users each`);
    
    // Process each batch in a separate transaction
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`\nProcessing batch ${batchIndex + 1} of ${batches.length} (${batch.length} users)`);
      
      // Begin transaction for this batch
      await client.query('BEGIN');
      
      try {
        // Insert each user in this batch
        for (const user of batch) {
          try {
            await client.query(`
              INSERT INTO users (
                username, full_name, phone, password, 
                email, balance, created_at, 
                is_admin, is_banned, referral_code
              ) VALUES (
                $1, $2, $3, $4, 
                $5, $6, $7, 
                $8, $9, $10
              )
            `, [
              user.username,
              user.fullName,
              user.phone,
              standardPassword,
              `${user.phone}@example.com`,
              JSON.stringify({ INR: 0, BTC: 0, ETH: 0, USDT: 0 }), // All balances start at zero
              new Date(),
              user.isAdmin,
              user.isBanned,
              user.referralCode
            ]);
            
            importedCount++;
          } catch (err) {
            console.error(`Error inserting user with phone ${user.phone}:`, err.message);
            skippedCount++;
          }
        }
        
        // Commit transaction for this batch
        await client.query('COMMIT');
        console.log(`Successfully imported batch ${batchIndex + 1}`);
      } catch (err) {
        // Rollback on transaction error
        await client.query('ROLLBACK');
        console.error(`Error processing batch ${batchIndex + 1}:`, err.message);
        skippedCount += batch.length;
      }
    }
    
    // Get final count for verification
    const finalCountResult = await client.query('SELECT COUNT(*) FROM users');
    const finalCount = parseInt(finalCountResult.rows[0].count);
    
    // Print summary report
    console.log("\n======================================");
    console.log("  IMPORT SUMMARY                     ");
    console.log("======================================");
    console.log(`Initial user count:     ${initialCount}`);
    console.log(`Final user count:       ${finalCount}`);
    console.log(`Users added:            ${finalCount - initialCount}`);
    console.log(`Successful imports:     ${importedCount}`);
    console.log(`Duplicate phones:       ${duplicateCount}`);
    console.log(`Invalid phone numbers:  ${invalidCount}`);
    console.log(`Failed imports:         ${skippedCount}`);
    console.log("======================================");
    
    console.log("\nImport process complete!");
    console.log("All imported users can log in with their phone number and any password");
    console.log("All imported users have been assigned a zero balance");
    
  } catch (err) {
    console.error('Error in import process:', err.message);
  } finally {
    // Clean up temporary tables
    try {
      await client.query('DROP TABLE IF EXISTS existing_phones');
    } catch (err) {
      console.error('Error dropping temporary table:', err.message);
    }
    
    // Close connections
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the main import function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});