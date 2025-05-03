// Direct test of game outcome control functionality
// This test bypasses authentication to directly test the functionality

/**
 * This test directly tests the game outcome control middleware functionality
 * without requiring authentication cookies or API calls.
 */

import { gameOutcomeControl } from './server/middleware/gameOutcomeControl.ts';
import { storage } from './server/storage.ts';

// Test if admin can control game outcomes
async function testGameOutcomeControl() {
  console.log('---- TESTING ADMIN GAME OUTCOME CONTROL ----');

  try {
    // Configuration
    const userId = 3; // Any valid user ID in the database
    const crashGameId = 7; // ID of the Crash game (from earlier API call)
    const minesGameId = 1; // ID of the Mines game (from earlier API call)
    
    // Step 1: Reset any global controls to start with a clean state
    console.log('\n1. Resetting global game control...');
    await storage.resetGlobalGameControl();
    console.log('Reset global controls successfully');
    
    // Step 2: Test baseline behavior with no controls
    console.log('\n2. Testing crash point with no active controls...');
    const originalCrashPoint = 2.50; // Example crash point
    const targetMultiplier = 2.0; // Target multiplier
    
    const defaultCrashPoint = await gameOutcomeControl.getControlledCrashPoint(
      userId,
      crashGameId,
      originalCrashPoint,
      targetMultiplier
    );
    
    console.log(`Original crash point: ${originalCrashPoint}`);
    console.log(`Default controlled crash point: ${defaultCrashPoint}`);
    
    if (defaultCrashPoint !== originalCrashPoint) {
      console.error('UNEXPECTED: Crash point was modified with no active controls');
    } else {
      console.log('PASS: No controls active, crash point remained unchanged');
    }
    
    // Step 3: Set global control to make all users win
    console.log('\n3. Setting global control to make all users win...');
    await storage.makeAllUsersWin([crashGameId]); // Only affect crash game
    console.log('Global WIN control set successfully');
    
    // Step 4: Test crash point with win control
    console.log('\n4. Testing crash point with WIN control...');
    const winCrashPoint = await gameOutcomeControl.getControlledCrashPoint(
      userId,
      crashGameId,
      originalCrashPoint,
      targetMultiplier
    );
    
    console.log(`Original crash point: ${originalCrashPoint}`);
    console.log(`WIN-controlled crash point: ${winCrashPoint}`);
    
    // Verify the controlled point is higher than target multiplier
    if (winCrashPoint <= targetMultiplier) {
      console.error('FAIL: Win control did not increase crash point above target multiplier!');
    } else {
      console.log('PASS: Win control correctly increased crash point above target multiplier');
    }
    
    // Step 5: Set global control to make all users lose
    console.log('\n5. Setting global control to make all users lose...');
    await storage.makeAllUsersLose([crashGameId]); // Only affect crash game
    console.log('Global LOSE control set successfully');
    
    // Step 6: Test crash point with lose control
    console.log('\n6. Testing crash point with LOSE control...');
    const loseCrashPoint = await gameOutcomeControl.getControlledCrashPoint(
      userId,
      crashGameId,
      originalCrashPoint,
      targetMultiplier
    );
    
    console.log(`Original crash point: ${originalCrashPoint}`);
    console.log(`LOSE-controlled crash point: ${loseCrashPoint}`);
    
    // Verify the controlled point is lower than target multiplier
    if (loseCrashPoint >= targetMultiplier) {
      console.error('FAIL: Lose control did not decrease crash point below target multiplier!');
    } else {
      console.log('PASS: Lose control correctly decreased crash point below target multiplier');
    }
    
    // Step 7: Test Mines game with win control
    console.log('\n7. Testing mines positions with WIN control...');
    
    // Reset and set win control for Mines game
    await storage.resetGlobalGameControl();
    await storage.makeAllUsersWin([minesGameId]); // Only affect mines game
    
    // Generate some original mine positions (random indexes between 0-24)
    const originalMinePositions = Array.from({ length: 5 }, () => Math.floor(Math.random() * 25));
    const currentlyRevealed = [2, 10, 15]; // Assume user revealed these positions
    
    const winMinePositions = await gameOutcomeControl.getControlledMinePositions(
      userId,
      minesGameId,
      originalMinePositions,
      currentlyRevealed
    );
    
    console.log('Original mine positions:', originalMinePositions);
    console.log('Currently revealed:', currentlyRevealed);
    console.log('WIN-controlled mine positions:', winMinePositions);
    
    // Verify no mines are in the revealed positions
    const anyMineInRevealed = currentlyRevealed.some(pos => winMinePositions.includes(pos));
    
    if (anyMineInRevealed) {
      console.error('FAIL: Win control did not remove mines from revealed positions!');
    } else {
      console.log('PASS: Win control correctly removed mines from revealed positions');
    }
    
    // Step 8: Reset all controls to clean up
    console.log('\n8. Resetting global game control...');
    await storage.resetGlobalGameControl();
    console.log('All controls reset successfully');
    
    console.log('\n---- TEST COMPLETED SUCCESSFULLY ----');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute the test
testGameOutcomeControl();