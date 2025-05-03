import { Router, Request, Response } from 'express';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';

const router = Router();

// Endpoint to check if an outcome should be forced for a user on a specific game
router.post('/check-outcome-control', async (req: Request, res: Response) => {
  try {
    const { gameId, targetMultiplier } = req.body;
    
    // Ensure user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user ID from the authenticated session
    const userId = req.user.id;
    
    if (!gameId) {
      return res.status(400).json({ message: 'Game ID is required' });
    }
    
    // Check game outcome control
    const outcomeControl = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
    
    // Return the outcome control settings
    res.json(outcomeControl);
  } catch (error) {
    console.error('Error checking outcome control:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get a controlled crash point 
router.post('/crash/get-controlled-point', async (req: Request, res: Response) => {
  try {
    const { gameId, originalCrashPoint, targetMultiplier } = req.body;
    
    // Ensure user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user ID from the authenticated session
    const userId = req.user.id;
    
    if (!gameId || originalCrashPoint === undefined) {
      return res.status(400).json({ message: 'Game ID and original crash point are required' });
    }
    
    // Get controlled crash point based on admin settings
    const controlledCrashPoint = await gameOutcomeControl.getControlledCrashPoint(
      userId,
      gameId,
      originalCrashPoint,
      targetMultiplier || 2.0 // Default target multiplier if not provided
    );
    
    // Return the controlled crash point
    res.json({ 
      originalCrashPoint, 
      controlledCrashPoint,
      wasModified: originalCrashPoint !== controlledCrashPoint
    });
  } catch (error) {
    console.error('Error getting controlled crash point:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to get controlled mine positions
router.post('/mines/get-controlled-positions', async (req: Request, res: Response) => {
  try {
    const { gameId, originalMinePositions, currentlyRevealed } = req.body;
    
    // Ensure user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user ID from the authenticated session  
    const userId = req.user.id;
    
    if (!gameId || !originalMinePositions) {
      return res.status(400).json({ message: 'Game ID and original mine positions are required' });
    }
    
    // Get controlled mine positions based on admin settings
    const controlledMinePositions = await gameOutcomeControl.getControlledMinePositions(
      userId,
      gameId,
      originalMinePositions,
      currentlyRevealed || []
    );
    
    // Return the controlled mine positions
    res.json({ 
      originalMinePositions, 
      controlledMinePositions,
      wasModified: JSON.stringify(originalMinePositions) !== JSON.stringify(controlledMinePositions)
    });
  } catch (error) {
    console.error('Error getting controlled mine positions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;