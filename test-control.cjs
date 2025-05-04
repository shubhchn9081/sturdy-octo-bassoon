const { storage } = require('./server/storage');
const { gameOutcomeControl } = require('./server/middleware/gameOutcomeControl');
const { generatePlinkoOutcome } = require('./server/games/plinko');

// Test ID values
const userId = 3;
const gameId = 2; // Plinko

async function testPlinkoControl() {
  try {
    console.log('\n--- TESTING PLINKO GAME EXACT 2X MULTIPLIER CONTROL ---\n');
    
    // First, ensure global win control is activated
    const globalControl = await storage.getGlobalGameControl();
    console.log('Current Global Control:', JSON.stringify(globalControl, null, 2));
    
    // Reset and set global win control
    console.log('\nResetting global game control...');
    await storage.resetGlobalGameControl();
    
    // Make all users win with exact 2.0x multiplier
    console.log('\nSetting global control to make all users win with EXACT 2.0x multiplier...');
    await storage.makeAllUsersWin([], 2.0, true);
    
    // Verify the setting
    const updatedControl = await storage.getGlobalGameControl();
    console.log('Updated Global Control:', JSON.stringify(updatedControl, null, 2));
    
    // Check if the outcome should be forced according to the middleware
    console.log('\nChecking forced outcome from middleware...');
    const controlResult = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
    console.log('Control Result:', JSON.stringify(controlResult, null, 2));
    
    // Test Plinko outcome directly
    console.log('\nTesting Plinko outcome generation with 2.0x multiplier control...');
    
    // Sample params
    const params = {
      betAmount: 100,
      rows: 16,
      risk: 'medium'
    };
    
    // Server seed and client seed for testing
    const serverSeed = 'test-server-seed';
    const clientSeed = 'test-client-seed';
    const nonce = 1;
    
    // Generate outcome 5 times to check consistency
    for (let i = 0; i < 5; i++) {
      console.log(`\nTest #${i+1}:`);
      const outcome = await generatePlinkoOutcome(
        userId,
        gameId,
        params,
        serverSeed + i, // Use different seeds for each test
        clientSeed + i,
        nonce + i
      );
      
      console.log('Generated Path:', outcome.path);
      console.log('Resulting Multiplier:', outcome.multiplier);
      console.log('Is close to 2.0x?', Math.abs(outcome.multiplier - 2.0) < 0.1);
    }
    
    console.log('\n--- PLINKO GAME CONTROL TEST COMPLETE ---');
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testPlinkoControl();