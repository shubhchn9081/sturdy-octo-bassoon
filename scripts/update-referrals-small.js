#!/usr/bin/env node

/**
 * Batch Referral Code Generator (Small Batches Version)
 * This script updates users without referral codes in smaller batches
 */

import pg from 'pg';
import crypto from 'crypto';

// Load database connection from environment
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuration
const BATCH_SIZE = 20; // Use smaller batches
const REFERRAL_CODE_LENGTH = 6;

// Generate a random referral code
function generateReferralCode(length = REFERRAL_CODE_LENGTH) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

async function main() {
  console.log("======================================");
  console.log("  BATCH REFERRAL CODE GENERATOR       ");
  console.log("  (SMALL BATCHES VERSION)            ");
  console.log("======================================");
  
  const client = await pool.connect();
  
  try {
    // Get users without referral codes
    const usersResult = await client.query(`
      SELECT id FROM users 
      WHERE referral_code IS NULL OR referral_code = ''
      ORDER BY id
    `);
    
    const users = usersResult.rows;
    console.log(`Found ${users.length} users that need referral codes`);
    
    if (users.length === 0) {
      console.log("No users need referral codes. Exiting.");
      return;
    }
    
    // Split users into smaller batches
    const batches = [];
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      batches.push(users.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Organized ${batches.length} batches with up to ${BATCH_SIZE} users each`);
    
    // Track progress
    let totalUpdated = 0;
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      console.log(`Processing batch ${batchIndex + 1} of ${batches.length} (${batches[batchIndex].length} users)`);
      
      // Begin transaction
      await client.query('BEGIN');
      
      try {
        // Update users in this batch
        for (const user of batches[batchIndex]) {
          // Generate a unique referral code
          let referralCode;
          let isUnique = false;
          
          while (!isUnique) {
            referralCode = generateReferralCode();
            
            // Check if code is unique
            const { rows } = await client.query(
              'SELECT COUNT(*) FROM users WHERE referral_code = $1',
              [referralCode]
            );
            
            isUnique = parseInt(rows[0].count) === 0;
          }
          
          // Update the user with the unique code
          await client.query(
            'UPDATE users SET referral_code = $1 WHERE id = $2',
            [referralCode, user.id]
          );
          
          totalUpdated++;
        }
        
        // Commit this batch
        await client.query('COMMIT');
        console.log(`Batch ${batchIndex + 1} committed: ${batches[batchIndex].length} users updated`);
        
      } catch (err) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error(`Error in batch ${batchIndex + 1}:`, err.message);
      }
      
      // Small pause between batches to prevent timeouts
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Verify results
    const finalCheckResult = await client.query(`
      SELECT COUNT(*) FROM users WHERE referral_code IS NULL OR referral_code = ''
    `);
    const remainingUsers = parseInt(finalCheckResult.rows[0].count);
    
    // Print summary
    console.log("\n======================================");
    console.log("  UPDATE SUMMARY                     ");
    console.log("======================================");
    console.log(`Total users processed:   ${users.length}`);
    console.log(`Users updated:           ${totalUpdated}`);
    console.log(`Remaining to update:     ${remainingUsers}`);
    console.log("======================================");
    
    if (remainingUsers === 0) {
      console.log("\nReferral code generation complete. All users have referral codes.");
    } else {
      console.log(`\nSome users (${remainingUsers}) still need referral codes.`);
      console.log("Run this script again to update the remaining users.");
    }
    
  } catch (err) {
    console.error('Error in batch processing:', err.message);
  } finally {
    client.release();
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});