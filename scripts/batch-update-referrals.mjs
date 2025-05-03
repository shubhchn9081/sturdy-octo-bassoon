#!/usr/bin/env node

/**
 * Batch Referral Code Generator
 * Assigns unique referral codes to any users that don't have them
 */

import pg from 'pg';
import { randomBytes } from 'crypto';

const { Pool } = pg;

// Load database connection from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuration
const BATCH_SIZE = 100; // How many users to update in a single transaction

// Generate a unique referral code
function generateReferralCode() {
  // Create an 8-character alphanumeric code
  return randomBytes(4)
    .toString('hex')
    .toUpperCase();
}

async function main() {
  console.log("======================================");
  console.log("  BATCH REFERRAL CODE GENERATOR       ");
  console.log("======================================");
  
  const client = await pool.connect();
  
  try {
    // Count users without referral codes
    const countResult = await client.query(`
      SELECT COUNT(*) 
      FROM users 
      WHERE referral_code IS NULL OR referral_code = ''
    `);
    
    const usersToUpdate = parseInt(countResult.rows[0].count);
    
    if (usersToUpdate === 0) {
      console.log("All users already have referral codes. Nothing to do!");
      return;
    }
    
    console.log(`Found ${usersToUpdate} users that need referral codes`);
    
    // Get IDs of users without referral codes
    const userIdsResult = await client.query(`
      SELECT id 
      FROM users 
      WHERE referral_code IS NULL OR referral_code = ''
      ORDER BY id
    `);
    
    const userIds = userIdsResult.rows.map(row => row.id);
    
    // Create batches
    const batches = [];
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      batches.push(userIds.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Organized ${batches.length} batches with up to ${BATCH_SIZE} users each`);
    
    // Process each batch
    let updatedCount = 0;
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length} (${batch.length} users)`);
      
      // Begin transaction
      await client.query('BEGIN');
      
      try {
        // Update each user in the batch
        for (const userId of batch) {
          const referralCode = generateReferralCode();
          
          await client.query(`
            UPDATE users 
            SET referral_code = $1 
            WHERE id = $2
          `, [referralCode, userId]);
          
          updatedCount++;
        }
        
        // Commit transaction
        await client.query('COMMIT');
        console.log(`Successfully updated batch ${batchIndex + 1}`);
      } catch (err) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error(`Error processing batch ${batchIndex + 1}:`, err.message);
      }
    }
    
    // Print summary
    console.log("\n======================================");
    console.log("  UPDATE SUMMARY                     ");
    console.log("======================================");
    console.log(`Users needing referral codes: ${usersToUpdate}`);
    console.log(`Users successfully updated:  ${updatedCount}`);
    console.log(`Success rate:                ${((updatedCount / usersToUpdate) * 100).toFixed(2)}%`);
    console.log("======================================");
    
    console.log("\nReferral code update complete!");
  } catch (err) {
    console.error('Error in update process:', err.message);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the update process
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});