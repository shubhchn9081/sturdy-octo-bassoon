#!/usr/bin/env node

/**
 * Balance Reset Tool
 * This script resets all balances of bulk-imported users to zero
 */

import pg from 'pg';

// Load database connection from environment
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Zero balance JSON value
const ZERO_BALANCE = JSON.stringify({
  INR: 0,
  BTC: 0,
  ETH: 0,
  USDT: 0
});

async function main() {
  console.log("======================================");
  console.log("  BULK USER BALANCE RESET TOOL       ");
  console.log("======================================");
  
  const client = await pool.connect();
  
  try {
    // Get current user count for bulk-imported users
    const countResult = await client.query(`
      SELECT COUNT(*) FROM users
      WHERE username LIKE 'user\\_%'
    `);
    const userCount = parseInt(countResult.rows[0].count);
    console.log(`\nFound ${userCount} bulk-imported users to update`);
    
    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Update all balances
      const updateResult = await client.query(`
        UPDATE users
        SET balance = $1
        WHERE username LIKE 'user\\_%'
      `, [ZERO_BALANCE]);
      
      await client.query('COMMIT');
      
      console.log(`Updated balances for ${updateResult.rowCount} users to zero`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating balances:', error.message);
    }
    
    // Check a sample after update
    const sampleResult = await client.query(`
      SELECT id, username, balance FROM users
      WHERE username LIKE 'user\\_%'
      LIMIT 5
    `);
    
    console.log("\nSample updated users:");
    sampleResult.rows.forEach(row => {
      console.log(`- ${row.username}: ${JSON.stringify(row.balance)}`);
    });
    
    console.log("\n======================================");
    console.log("  BALANCE RESET COMPLETE             ");
    console.log("======================================");
    
  } catch (err) {
    console.error('Error in process:', err.message);
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