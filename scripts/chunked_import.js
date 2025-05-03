#!/usr/bin/env node

/**
 * Ultra-simplified chunked import with minimal DB operations
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
const CHUNK_SIZE = 10; // Very small chunks to ensure completion
const CHUNK_START = 0; // Start from this chunk index (for resuming failed imports)

// Password hashing
function hashPassword(password) {
  const salt = crypto.createHash('md5').update(Math.random().toString()).digest('hex');
  const hashedPassword = crypto.createHash('sha512')
    .update(password + salt)
    .digest('hex');
  return `${hashedPassword}.${salt}`;
}

// Generate username from phone
function generateUsernameFromPhone(phone) {
  const lastDigits = phone.slice(-6);
  return `user_${lastDigits}`;
}

// Main function
async function main() {
  console.log("Starting chunked import process...");
  
  try {
    // Read and parse CSV right away
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });
    console.log(`CSV has ${records.length} total rows`);
    
    // Prepare hash password once
    const hashedPassword = hashPassword('password');
    
    // Count users before import
    const initialCount = await getUserCount();
    console.log(`Initial user count: ${initialCount}`);
    
    // Get existing phone numbers
    const phones = await getExistingPhones();
    console.log(`Found ${phones.size} existing phones`);
    
    // Process the records in very small chunks
    const chunks = chunkArray(records, CHUNK_SIZE);
    console.log(`Split data into ${chunks.length} chunks of ${CHUNK_SIZE} records each`);
    
    let total_imported = 0;
    let total_skipped = 0;
    
    // Process each chunk with a separate pool connection
    for (let i = CHUNK_START; i < chunks.length; i++) {
      console.log(`\nProcessing chunk ${i+1} of ${chunks.length}`);
      const chunk = chunks[i];
      
      const { imported, skipped } = await processChunk(chunk, phones, hashedPassword, i);
      
      total_imported += imported;
      total_skipped += skipped;
      
      console.log(`Chunk ${i+1} results: ${imported} imported, ${skipped} skipped`);
      console.log(`Running totals: ${total_imported} imported, ${total_skipped} skipped`);
      
      // Check current count occasionally
      if (i % 10 === 0 || i === chunks.length - 1) {
        const currentCount = await getUserCount();
        console.log(`Current user count: ${currentCount} (added ${currentCount - initialCount} so far)`);
      }
    }
    
    // Final count
    const finalCount = await getUserCount();
    
    console.log("\nImport Summary:");
    console.log(`Starting user count: ${initialCount}`);
    console.log(`Final user count: ${finalCount}`);
    console.log(`Users added: ${finalCount - initialCount}`);
    console.log(`Total processed: ${total_imported + total_skipped}`);
  } catch (error) {
    console.error("Error in main process:", error.message);
  } finally {
    await pool.end();
    console.log("Pool connections closed");
  }
}

// Get count of users
async function getUserCount() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  } finally {
    client.release();
  }
}

// Get existing phone numbers
async function getExistingPhones() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT phone FROM users');
    return new Set(result.rows.map(row => row.phone));
  } finally {
    client.release();
  }
}

// Process a single chunk
async function processChunk(chunk, phones, hashedPassword, chunkIndex) {
  let imported = 0;
  let skipped = 0;
  
  // Create a new client for this chunk
  const client = await pool.connect();
  
  try {
    // Begin transaction for this chunk only
    await client.query('BEGIN');
    
    for (const record of chunk) {
      const phone = record.Phone;
      
      // Skip invalid or existing phones
      if (!phone || phones.has(phone)) {
        skipped++;
        continue;
      }
      
      try {
        // Generate unique username
        const username = generateUsernameFromPhone(phone) + "_" + chunkIndex + "_" + Math.floor(Math.random() * 1000);
        
        // Extract fullName
        const fullName = record.Username || username;
        
        // Insert user with all required fields
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
          fullName,
          phone,
          hashedPassword,
          `${phone}@example.com`,
          '{"INR": 0, "BTC": 0, "ETH": 0, "USDT": 0}',
          new Date(),
          false,
          false
        ]);
        
        // Track this phone as processed
        phones.add(phone);
        imported++;
      } catch (err) {
        console.log(`Error inserting user with phone ${phone}: ${err.message}`);
        skipped++;
      }
    }
    
    // Commit changes for this chunk
    await client.query('COMMIT');
    return { imported, skipped };
  } catch (err) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error(`Error processing chunk ${chunkIndex}:`, err.message);
    return { imported: 0, skipped: chunk.length };
  } finally {
    client.release();
  }
}

// Helper to split array into chunks
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Run the main function
main().catch(console.error);