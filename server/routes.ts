import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertBetSchema, insertUserSchema } from "@shared/schema";
import { calculateCrashPoint, calculateDiceRoll, calculateLimboResult, createServerSeed, verifyBet } from "./games/provably-fair";
import { setupAuth } from "./auth";

// Configure multer storage
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error("Error: File upload only supports image files"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // prefix all routes with /api

  // Initialize the database with some game data if none exists
  app.get('/api/initialize', async (req, res) => {
    try {
      // Check if we have games
      const games = await storage.getAllGames();
      
      // If there are already games, do nothing
      if (games.length > 0) {
        return res.json({ message: 'Database already initialized', gamesCount: games.length });
      }
      
      // Import GAMES from the client list (these should match the InsertGame schema)
      const { GAMES } = await import('../client/src/games');
      
      // Initialize database with games
      for (const game of GAMES) {
        await storage.createGame({
          name: game.name,
          slug: game.slug,
          type: game.type,
          activePlayers: game.activePlayers || Math.floor(Math.random() * 10000),
          rtp: game.rtp || 99,
          maxMultiplier: game.maxMultiplier || 1000,
          minBet: game.minBet || 0.00000001,
          maxBet: game.maxBet || 100,
          imageUrl: null
        });
      }
      
      // Create a demo user if needed
      const demoUser = await storage.getUserByUsername('demo_user');
      if (!demoUser) {
        await storage.createUser({
          username: 'demo_user',
          email: 'demo@example.com',
          password: 'hashed_password', // In a real app, this would be properly hashed
          dateOfBirth: new Date('1990-01-01'),
          phone: null,
          referralCode: null,
          language: 'English'
        });
      }
      
      res.json({ 
        message: 'Database initialized successfully', 
        gamesCount: GAMES.length
      });
    } catch (error) {
      console.error('Initialization error:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Games routes
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error('Error fetching games:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });

  // User routes - handled by auth.ts
  // The /api/user endpoint is already defined in auth.ts
  
  app.get('/api/user/balance', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const user = req.user as Express.User;
      res.json(user.balance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Game routes
  
  // Initialize database with games (dev only)
  app.post('/api/initialize-games', async (req, res) => {
    try {
      // Import GAMES array from client
      const { GAMES } = require('../client/src/games');
      
      // Check if games already exist
      const existingGames = await storage.getAllGames();
      
      if (existingGames.length > 0) {
        return res.json({ 
          message: 'Games already initialized', 
          count: existingGames.length,
          games: existingGames
        });
      }
      
      // Initialize games from frontend list
      const createdGames = [];
      for (const game of GAMES) {
        const gameRecord = await storage.createGame({
          name: game.name,
          slug: game.slug,
          type: game.type,
          activePlayers: game.activePlayers || Math.floor(Math.random() * 10000),
          rtp: game.rtp || 99,
          maxMultiplier: game.maxMultiplier || 1000,
          minBet: game.minBet || 0.00000001,
          maxBet: game.maxBet || 100,
          imageUrl: null
        });
        createdGames.push(gameRecord);
      }
      
      res.json({ 
        message: 'Games initialized successfully', 
        count: createdGames.length,
        games: createdGames
      });
    } catch (error) {
      console.error('Error initializing games:', error);
      res.status(500).json({ 
        message: 'Failed to initialize games', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.get('/api/games/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Game image upload endpoint
  // Serve uploaded images directly
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'public', 'uploads', path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  app.post('/api/games/:id/upload-image', upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }
      
      // Create the URL for the image
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // If there's an existing image, delete it
      if (game.imageUrl) {
        const oldImagePath = path.join(process.cwd(), 'public', game.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Update the game with the new image URL
      const updatedGame = await storage.updateGameImage(id, imageUrl);
      
      res.json({ 
        success: true, 
        game: updatedGame,
        imageUrl
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ 
        message: 'Server error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Bet routes
  app.post('/api/bets/place', async (req, res) => {
    try {
      // Validate request body
      const betSchema = insertBetSchema.extend({
        options: z.record(z.any()).optional()
      });
      
      const validatedData = betSchema.parse(req.body);
      
      // Get user and game
      const user = await storage.getUser(validatedData.userId);
      const game = await storage.getGame(validatedData.gameId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      // Check if user has enough balance
      if (user.balance < validatedData.amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Generate server seed
      const serverSeed = createServerSeed();
      
      // Create bet with initial state
      const bet = await storage.createBet({
        ...validatedData,
        serverSeed,
        nonce: 1,
        outcome: {},
      });
      
      // Deduct bet amount from user balance
      await storage.updateUserBalance(user.id, user.balance - validatedData.amount);
      
      res.json({ betId: bet.id, serverSeedHash: bet.serverSeed });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid bet data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/bets/:id/complete', async (req, res) => {
    try {
      const betId = parseInt(req.params.id);
      const bet = await storage.getBet(betId);
      
      if (!bet) {
        return res.status(404).json({ message: 'Bet not found' });
      }
      
      if (bet.completed) {
        return res.status(400).json({ message: 'Bet already completed' });
      }
      
      // Validate outcome based on game type
      const game = await storage.getGame(bet.gameId);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      // Update bet with outcome and mark as completed
      const updatedBet = await storage.updateBet(betId, {
        ...bet,
        outcome: req.body.outcome,
        completed: true,
        multiplier: req.body.outcome.win ? req.body.outcome.multiplier : 0
      });
      
      // Update user balance if won
      if (req.body.outcome.win) {
        const user = await storage.getUser(bet.userId);
        if (user) {
          const winAmount = bet.amount * req.body.outcome.multiplier;
          await storage.updateUserBalance(user.id, user.balance + winAmount);
        }
      }
      
      res.json(updatedBet);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/bets/history', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      
      const bets = await storage.getBetHistory(userId, gameId);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Provably fair verification
  app.post('/api/verify', async (req, res) => {
    try {
      const { serverSeed, clientSeed, nonce, gameType } = req.body;
      
      if (!serverSeed || !clientSeed || !nonce || !gameType) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      let result;
      
      switch (gameType) {
        case 'dice':
          result = calculateDiceRoll(serverSeed, clientSeed, nonce);
          break;
        case 'crash':
          result = calculateCrashPoint(serverSeed, clientSeed, nonce);
          break;
        case 'limbo':
          result = calculateLimboResult(serverSeed, clientSeed, nonce);
          break;
        default:
          return res.status(400).json({ message: 'Invalid game type' });
      }
      
      res.json({ result });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
