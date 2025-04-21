import { Express } from 'express';
import { storage } from './storage';

// This file contains special development endpoints that would not be included in production
export function setupDevEndpoints(app: Express) {
  // Special endpoint to make a user an admin (for development purposes only)
  app.post('/api/dev/make-admin/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: `User '${username}' not found` });
      }
      
      // Use the existing updateUserAdmin method from storage
      const updatedUser = await storage.updateUserAdmin(user.id, true);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user admin status" });
      }
      
      res.json({
        message: `User '${username}' is now an admin`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          isAdmin: updatedUser.isAdmin
        }
      });
    } catch (error: any) {
      console.error('Error making user admin:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error.message
      });
    }
  });
}