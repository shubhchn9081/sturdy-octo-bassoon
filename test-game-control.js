const fetch = require('node-fetch');

// URL for the API
const API_URL = 'http://localhost:5000';

// Configuration
const userId = 3; // Replace with an actual user ID in your system
const gameId = 2;  // Assuming this is the Crash game ID
const AUTH_COOKIE = 'connect.sid=YOUR_SESSION_COOKIE'; // Replace with actual auth cookie

// Test if admin can control game outcomes
async function testGameOutcomeControl() {
  console.log('---- TESTING ADMIN GAME OUTCOME CONTROL ----');

  try {
    // Step 1: Check current global control status
    console.log('\n1. Checking current global game control status...');
    const globalControlResp = await fetch(`${API_URL}/api/admin/global-game-control`, {
      headers: {
        'Cookie': AUTH_COOKIE
      }
    });
    
    if (!globalControlResp.ok) {
      throw new Error(`Failed to get global controls: ${globalControlResp.status} ${globalControlResp.statusText}`);
    }
    
    const globalControl = await globalControlResp.json();
    console.log('Current global control:', globalControl);

    // Step 2: Reset global control to make sure we start from a clean state
    console.log('\n2. Resetting global game control...');
    const resetResp = await fetch(`${API_URL}/api/admin/global-game-control/reset`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      }
    });
    
    if (!resetResp.ok) {
      throw new Error(`Failed to reset global controls: ${resetResp.status} ${resetResp.statusText}`);
    }
    
    const resetResult = await resetResp.json();
    console.log('Reset result:', resetResult);

    // Step 3: Test the crash game point control - get original point
    console.log('\n3. Testing crash point generation without control...');
    const originalCrashPoint = 2.50; // Example crash point
    const targetMultiplier = 2.0; // Target multiplier

    const crashPointResp = await fetch(`${API_URL}/api/game-control/crash/get-controlled-point`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        originalCrashPoint,
        targetMultiplier
      })
    });
    
    if (!crashPointResp.ok) {
      throw new Error(`Failed to get crash point: ${crashPointResp.status} ${crashPointResp.statusText}`);
    }
    
    const crashPointResult = await crashPointResp.json();
    console.log('Crash point without control:', crashPointResult);

    // Step 4: Set global control to make all users win
    console.log('\n4. Setting global control to make all users win...');
    const setWinResp = await fetch(`${API_URL}/api/admin/global-game-control/win`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        affectedGames: [gameId] // Only affect the crash game
      })
    });
    
    if (!setWinResp.ok) {
      throw new Error(`Failed to set win control: ${setWinResp.status} ${setWinResp.statusText}`);
    }
    
    const setWinResult = await setWinResp.json();
    console.log('Set win result:', setWinResult);

    // Step 5: Test crash point again with win control enabled
    console.log('\n5. Testing crash point generation with WIN control...');
    const crashPointWinResp = await fetch(`${API_URL}/api/game-control/crash/get-controlled-point`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        originalCrashPoint,
        targetMultiplier
      })
    });
    
    if (!crashPointWinResp.ok) {
      throw new Error(`Failed to get win-controlled crash point: ${crashPointWinResp.status} ${crashPointWinResp.statusText}`);
    }
    
    const crashPointWinResult = await crashPointWinResp.json();
    console.log('Crash point with WIN control:', crashPointWinResult);
    
    // Verify the controlled point is higher than target multiplier
    if (crashPointWinResult.controlledCrashPoint <= targetMultiplier) {
      console.error('FAIL: Win control did not increase crash point above target multiplier!');
    } else {
      console.log('PASS: Win control correctly increased crash point above target multiplier');
    }

    // Step 6: Set global control to make all users lose
    console.log('\n6. Setting global control to make all users lose...');
    const setLoseResp = await fetch(`${API_URL}/api/admin/global-game-control/lose`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        affectedGames: [gameId] // Only affect the crash game
      })
    });
    
    if (!setLoseResp.ok) {
      throw new Error(`Failed to set lose control: ${setLoseResp.status} ${setLoseResp.statusText}`);
    }
    
    const setLoseResult = await setLoseResp.json();
    console.log('Set lose result:', setLoseResult);

    // Step 7: Test crash point again with lose control enabled
    console.log('\n7. Testing crash point generation with LOSE control...');
    const crashPointLoseResp = await fetch(`${API_URL}/api/game-control/crash/get-controlled-point`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        originalCrashPoint,
        targetMultiplier
      })
    });
    
    if (!crashPointLoseResp.ok) {
      throw new Error(`Failed to get lose-controlled crash point: ${crashPointLoseResp.status} ${crashPointLoseResp.statusText}`);
    }
    
    const crashPointLoseResult = await crashPointLoseResp.json();
    console.log('Crash point with LOSE control:', crashPointLoseResult);
    
    // Verify the controlled point is lower than target multiplier
    if (crashPointLoseResult.controlledCrashPoint >= targetMultiplier) {
      console.error('FAIL: Lose control did not decrease crash point below target multiplier!');
    } else {
      console.log('PASS: Lose control correctly decreased crash point below target multiplier');
    }

    // Step 8: Reset global controls
    console.log('\n8. Resetting global game control...');
    const finalResetResp = await fetch(`${API_URL}/api/admin/global-game-control/reset`, {
      method: 'POST',
      headers: {
        'Cookie': AUTH_COOKIE,
        'Content-Type': 'application/json'
      }
    });
    
    if (!finalResetResp.ok) {
      throw new Error(`Failed to reset global controls: ${finalResetResp.status} ${finalResetResp.statusText}`);
    }
    
    const finalResetResult = await finalResetResp.json();
    console.log('Final reset result:', finalResetResult);

    console.log('\n---- TEST COMPLETED SUCCESSFULLY ----');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Execute the test
testGameOutcomeControl();