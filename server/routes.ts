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
  // Setup authentication with Passport
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
          password: 'hashed_password', // In a real app, this would be properly hashed
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

  // User routes
  app.get('/api/user', async (req, res) => {
    try {
      // For demo purposes, return a sample user
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/user/balance', async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      res.json(user.balance);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Transaction routes
  app.get('/api/transactions', async (req, res) => {
    try {
      // For demo purposes, use a fixed user ID
      const userId = 1;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.post('/api/transactions', async (req, res) => {
    try {
      const { type, amount, currency = "BTC", status, txid, description } = req.body;
      
      // Validate required fields
      if (!type || !amount || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // For demo purposes, use a fixed user ID
      const userId = 1;
      
      const transaction = await storage.createTransaction({
        userId,
        type,
        amount,
        currency,
        status,
        txid,
        description
      });
      
      // If it's a deposit or withdrawal, update user balance
      if ((type === 'deposit' || type === 'withdrawal') && status === 'completed') {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const multiplier = type === 'deposit' ? 1 : -1;
        const newBalance = user.balance + (amount * multiplier);
        await storage.updateUserBalance(userId, newBalance);
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
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
        completed: false,
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
  
  // Login and auth routes
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In a real app, use proper password hashing
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      if (user.isBanned) {
        return res.status(403).json({ message: 'Your account has been banned' });
      }
      
      res.json({ 
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        balance: user.balance,
        createdAt: user.createdAt,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        referralCode: user.referralCode,
        language: user.language
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/register', async (req, res) => {
    try {
      // Validate with schema
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Return user without password
      res.status(201).json({ 
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isBanned: user.isBanned,
        balance: user.balance,
        createdAt: user.createdAt,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        referralCode: user.referralCode,
        language: user.language
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Admin routes
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.body.userId || parseInt(req.headers['user-id'] as string);
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      
      next();
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/update-admin', isAdmin, async (req, res) => {
    try {
      const { userId, isAdmin } = req.body;
      
      if (!userId || isAdmin === undefined) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const updatedUser = await storage.updateUserAdmin(userId, isAdmin);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating admin status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/update-ban', isAdmin, async (req, res) => {
    try {
      const { userId, isBanned } = req.body;
      
      if (!userId || isBanned === undefined) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const updatedUser = await storage.updateUserBanned(userId, isBanned);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating ban status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/set-balance', isAdmin, async (req, res) => {
    try {
      const { userId, currency, amount } = req.body;
      
      if (!userId || !currency || amount === undefined) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const updatedUser = await storage.setUserBalance(userId, currency, amount);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error setting balance:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/admin/game-settings', isAdmin, async (req, res) => {
    try {
      const gameSettings = await storage.getAllGameSettings();
      res.json(gameSettings);
    } catch (error) {
      console.error('Error getting game settings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/admin/game-settings/:gameId', isAdmin, async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const settings = await storage.getGameSettings(gameId);
      
      if (!settings) {
        return res.status(404).json({ message: 'Game settings not found' });
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error getting game settings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/game-settings', isAdmin, async (req, res) => {
    try {
      const { gameId, houseEdge, forceOutcome, forcedOutcomeValue, minBetAmount, maxBetAmount } = req.body;
      
      if (!gameId) {
        return res.status(400).json({ message: 'Game ID is required' });
      }
      
      // Check if settings already exist for this game
      const existingSettings = await storage.getGameSettings(gameId);
      
      if (existingSettings) {
        // Update existing settings
        const updatedSettings = await storage.updateGameSettings(gameId, {
          houseEdge,
          forceOutcome,
          forcedOutcomeValue,
          minBetAmount,
          maxBetAmount,
        });
        
        return res.json(updatedSettings);
      } else {
        // Create new settings
        const newSettings = await storage.createGameSettings({
          gameId,
          houseEdge: houseEdge || 1.0,
          forceOutcome: forceOutcome || false,
          forcedOutcomeValue: forcedOutcomeValue || null,
          minBetAmount: minBetAmount || 0.00001,
          maxBetAmount: maxBetAmount || 1.0,
        });
        
        return res.status(201).json(newSettings);
      }
    } catch (error) {
      console.error('Error creating/updating game settings:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
