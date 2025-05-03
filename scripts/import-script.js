#!/usr/bin/env node

/**
 * User Import Tool Wrapper Script
 * This script runs the direct-import.js script and then the batch-update-referrals.mjs script
 */

const { execSync } = require('child_process');
const path = require('path');

console.log("======================================");
console.log("  USER IMPORT TOOL WRAPPER           ");
console.log("======================================");

const scriptsDir = __dirname;

try {
  // Run the direct import script
  console.log("\nStep 1: Running bulk user import...");
  execSync(`node ${path.join(scriptsDir, 'direct-import.js')}`, { stdio: 'inherit' });
  
  // Reset user balances to zero
  console.log("\nStep 2: Resetting user balances to zero...");
  execSync(`node ${path.join(scriptsDir, 'reset-balances.js')}`, { stdio: 'inherit' });
  
  // Run the referral code generator
  console.log("\nStep 3: Generating referral codes for users...");
  execSync(`node ${path.join(scriptsDir, 'batch-update-referrals.mjs')}`, { stdio: 'inherit' });
  
  console.log("\n======================================");
  console.log("  IMPORT PROCESS COMPLETE            ");
  console.log("======================================");
  console.log("All users have been imported with zero balance!");
  console.log("The imported users can log in with their phone number and any password.");
  
} catch (error) {
  console.error("\nError running import process:", error.message);
  process.exit(1);
}