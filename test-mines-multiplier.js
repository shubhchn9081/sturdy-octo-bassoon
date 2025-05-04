// Test script for Mines game with correct multiplier table
// To be run with Node.js ES module syntax

import { storage } from './server/storage.js';
import { MINES_MULTIPLIER_TABLE, findClosestMultiplier } from './shared/minesMultiplierTable.js';

async function testMinesMultiplierTable() {
  console.log('\n--- TESTING MINES MULTIPLIER TABLE IMPLEMENTATION ---\n');
  
  // Test the multiplier table values
  console.log('Testing multiplier table values:');
  console.log('1 mine, 1 gem collected:', MINES_MULTIPLIER_TABLE[1][0]);
  console.log('5 mines, 3 gems collected:', MINES_MULTIPLIER_TABLE[5][2]);
  console.log('3 mines, 22 gems collected:', MINES_MULTIPLIER_TABLE[3][21], '\n');
  
  // Test finding exact 2.0x multiplier
  console.log('Finding closest configurations to 2.0x multiplier:');
  for (let mines = 1; mines <= 24; mines++) {
    const result = findClosestMultiplier(mines, 2.0);
    if (result) {
      console.log(`Mines: ${mines}, Gems: ${result.gems}, Multiplier: ${result.multiplier}`);
    } else {
      console.log(`Mines: ${mines}, No suitable configuration found`);
    }
  }
  
  // Test admin-controlled win with exact 2.0x multiplier
  console.log('\nSetting up global game control for exact 2.0x multiplier');
  await storage.resetGlobalGameControl();
  await storage.makeAllUsersWin([], 2.0, true);
  const globalControl = await storage.getGlobalGameControl();
  console.log('Global control settings:', globalControl);
  
  console.log('\n--- TEST COMPLETE ---');
}

testMinesMultiplierTable();