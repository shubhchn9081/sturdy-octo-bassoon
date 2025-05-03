#!/usr/bin/env node

/**
 * Ultra-efficient bulk import script
 * Uses direct SQL for maximum performance
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
const CHUNK_SIZE = 100; // How many records to insert at once

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
    
    // Get existing phone numbers to avoid duplicates - directly as a SQL condition
    const existingPhonesResult = await client.query('SELECT array_agg(phone) as phones FROM users');
    const existingPhones = new Set(existingPhonesResult.rows[0].phones || []);
    console.log(`Found ${existingPhones.size} existing phone numbers to avoid duplicates`);
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV has ${records.length} total rows`);
    
    // Prepare a single password hash for all users
    const hashedPassword = hashPassword('password');
    
    // Create arrays for batch processing
    let validRecords = [];
    let skippedCount = 0;
    let importedCount = 0;
    
    // Process records in chunks for efficiency
    for (const record of records) {
      const phone = record.Phone;
      
      if (!phone || existingPhones.has(phone)) {
        skippedCount++;
        continue;
      }
      
      // Generate a username directly from the phone
      const username = generateUsernameFromPhone(phone);
      
      // Add to valid records
      validRecords.push({
        username,
        phone,
        fullName: record.Username || username
      });
      
      // Mark as processed to avoid duplicates
      existingPhones.add(phone);
    }
    
    console.log(`Found ${validRecords.length} new users to import`);
    console.log(`Will skip ${skippedCount} records (missing phone or already exists)`);
    
    if (validRecords.length === 0) {
      console.log("No new users to import. Exiting.");
      return;
    }
    
    // Process in chunks to avoid timeouts
    for (let i = 0; i < validRecords.length; i += CHUNK_SIZE) {
      const chunk = validRecords.slice(i, i + CHUNK_SIZE);
      console.log(`Processing chunk ${i/CHUNK_SIZE + 1} of ${Math.ceil(validRecords.length/CHUNK_SIZE)}`);
      
      // Build multi-value insert statement for this chunk
      const valuePlaceholders = [];
      const values = [];
      let valueIndex = 1;
      
      for (const record of chunk) {
        valuePlaceholders.push(`($${valueIndex}, $${valueIndex+1}, $${valueIndex+2}, $${valueIndex+3}, $${valueIndex+4}, $${valueIndex+5}, $${valueIndex+6})`);
        values.push(
          record.username,
          record.fullName,
          record.phone,
          hashedPassword,
          '{"INR": 0, "BTC": 0, "ETH": 0, "USDT": 0}',
          new Date(),
          `${record.phone}@example.com`
        );
        valueIndex += 7;
      }
      
      // Create and execute the multi-insert statement
      const insertQuery = `
        INSERT INTO users (username, full_name, phone, password, balance, created_at, email)
        VALUES ${valuePlaceholders.join(', ')}
        ON CONFLICT (phone) DO NOTHING
      `;
      
      try {
        const result = await client.query(insertQuery, values);
        importedCount += result.rowCount;
        console.log(`Inserted ${result.rowCount} users in this chunk`);
      } catch (err) {
        console.error(`Error inserting chunk:`, err.message);
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
    
  } catch (err) {
    console.error('Error in bulk import:', err.message);
  } finally {
    // Release the client back to the pool
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the main function
main().catch(console.error);