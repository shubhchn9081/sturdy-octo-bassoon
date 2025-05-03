import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';

const router = Router();

// Endpoint to check if an outcome should be forced for a user on a specific game
router.post('/check-outcome-control', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { gameId, targetMultiplier } = req.body;
    const userId = req.session.userId!;
    
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
router.post('/crash/get-controlled-point', isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { gameId, originalCrashPoint, targetMultiplier } = req.body;
    const userId = req.session.userId!;
    
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
router.post('/mines/get-controlled-positions', isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { gameId, originalMinePositions, currentlyRevealed } = req.body;
    const userId = req.session.userId!;
    
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