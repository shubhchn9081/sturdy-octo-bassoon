import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertBetSchema, insertUserSchema, clientBetSchema } from "@shared/schema";
import { calculateCrashPoint, calculateDiceRoll, calculateLimboResult, createServerSeed, verifyBet } from "./games/provably-fair";
import { setupAuth } from "./auth";
import { setupDevEndpoints } from "./adminSetup";
import { isAdmin } from "./middleware/admin";

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
  
  // Setup development endpoints (make-admin endpoint)
  setupDevEndpoints(app);
  
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
          email: 'demo@example.com', 
          dateOfBirth: '1990-01-01',
          phone: '+1234567890'
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
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Use the authenticated user's ID from the session
      const user = req.user;
      
      // Omit sensitive information like password
      const { password, ...safeUserData } = user;
      
      res.json(safeUserData);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/user/balance', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Use the authenticated user's ID from the session
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Get currency from query params (default to INR)
      const currency = req.query.currency as string || 'INR';
      
      // Extract balance value based on its format
      let balanceValue = 0;
      
      if (typeof user.balance === 'number') {
        // Legacy numeric balance (treated as INR)
        balanceValue = currency === 'INR' ? user.balance : 0;
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        // JSONB format with multiple currencies
        // Cast to Record for TypeScript type safety
        const balanceObj = user.balance as Record<string, number>;
        balanceValue = balanceObj[currency] || 0;
      }
      
      // Return simplified balance response (for backward compatibility)
      res.json({ balance: balanceValue });
    } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Transaction routes
  app.get('/api/transactions', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Use the authenticated user's ID from the session
      const userId = req.user.id;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.post('/api/transactions', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const { type, amount, currency = "BTC", status, txid, description } = req.body;
      
      // Validate required fields
      if (!type || !amount || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Use authenticated user's ID
      const userId = req.user.id;
      
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
        // User is available from the session
        const user = req.user;
        
        // Update the balance with specified currency (default to INR)
        const multiplier = type === 'deposit' ? 1 : -1;
        const userCurrency = currency || 'INR';
        
        // Use updateUserBalance with currency specified
        await storage.updateUserBalance(userId, amount * multiplier, userCurrency);
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
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
      
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
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Validate request body
      // Use the client-side schema that doesn't include userId
      const betSchema = clientBetSchema.extend({
        options: z.record(z.any()).optional()
      });
      
      const validatedData = betSchema.parse(req.body);

      // Ensure the bet amount is a valid number
      // This ensures that string values or malformed numbers are properly converted
      validatedData.amount = parseFloat(validatedData.amount as any);
      if (isNaN(validatedData.amount)) {
        return res.status(400).json({ message: 'Invalid bet amount' });
      }
      
      // Get user from the authenticated session and game
      const user = req.user;
      const game = await storage.getGame(validatedData.gameId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      // Set currency to INR (default on our platform)
      const currency = 'INR';
      
      // Get the game's minimum bet amount
      const minBet = game.minBet || 100;
      
      // Log bet information for debugging
      console.log(`Placing bet - User: ${user.username}, Game: ${game.name}, Amount: ${validatedData.amount}`);
      
      // Don't allow bets below minimum amount
      if (validatedData.amount < minBet) {
        return res.status(400).json({ 
          message: `Bet amount must be at least ₹${minBet}`,
          minBet: minBet
        });
      }
      
      // Don't allow bets of 0 or negative amounts
      if (validatedData.amount <= 0) {
        return res.status(400).json({ message: 'Bet amount must be greater than 0' });
      }
      
      // Check if user has enough balance in INR
      let userINRBalance = 0;
      
      if (typeof user.balance === 'number') {
        // Legacy format - numeric balance is treated as INR
        userINRBalance = user.balance;
      } else if (typeof user.balance === 'object' && user.balance !== null) {
        // JSONB format with multiple currencies
        const balanceObj = user.balance as Record<string, number>;
        userINRBalance = balanceObj.INR || 0;
      }
      
      if (userINRBalance < validatedData.amount) {
        return res.status(400).json({ message: `Insufficient INR balance: ${userINRBalance}` });
      }
      
      // Generate server seed for provable fairness
      const serverSeed = createServerSeed();
      
      // Create bet with initial state
      const bet = await storage.createBet({
        ...validatedData,
        userId: user.id, // Explicitly set userId from authenticated user
        serverSeed,
        nonce: 1,
        outcome: {}, // Empty outcome until bet is completed
      });
      
      // Deduct bet amount from user's INR balance (using INR as default currency)
      await storage.updateUserBalance(user.id, -validatedData.amount, 'INR');
      
      // Add transaction record for the bet placement if available
      if (storage.createTransaction) {
        try {
          await storage.createTransaction({
            userId: user.id,
            type: 'BET',
            amount: validatedData.amount, // Store as positive amount for accounting
            status: 'COMPLETED',
            currency: currency,
            description: `Bet placed on ${game.name}`,
          });
        } catch (err) {
          console.error('Error creating bet transaction record:', err);
          // Don't fail the whole request if transaction creation fails
        }
      }
      
      res.json({ betId: bet.id, serverSeedHash: bet.serverSeed });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid bet data', errors: error.errors });
      }
      console.error('Error placing bet:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/bets/:id/complete', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const betId = parseInt(req.params.id);
      const bet = await storage.getBet(betId);
      
      if (!bet) {
        return res.status(404).json({ message: 'Bet not found' });
      }
      
      // Ensure the bet belongs to the authenticated user
      if (bet.userId !== req.user.id) {
        return res.status(403).json({ message: 'You can only complete your own bets' });
      }
      
      if (bet.completed) {
        return res.status(400).json({ message: 'Bet already completed' });
      }
      
      // Validate outcome based on game type
      const game = await storage.getGame(bet.gameId);
      
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
      
      // Ensure the multiplier is a valid number
      if (req.body.outcome.win) {
        req.body.outcome.multiplier = parseFloat(req.body.outcome.multiplier);
        if (isNaN(req.body.outcome.multiplier) || req.body.outcome.multiplier <= 0) {
          return res.status(400).json({ message: 'Invalid multiplier value' });
        }
      }
      
      // Get profit value based on win/loss
      const profit = req.body.outcome.win ? (bet.amount * req.body.outcome.multiplier) - bet.amount : -bet.amount;
      
      // Update bet with outcome and mark as completed
      const updatedBet = await storage.updateBet(betId, {
        ...bet,
        outcome: req.body.outcome,
        completed: true,
        multiplier: req.body.outcome.win ? req.body.outcome.multiplier : 0,
        profit: profit
      });
      
      // Update user balance if won
      if (req.body.outcome.win) {
        // Get the authenticated user directly
        const user = req.user;
        
        // Here's where the bug was! 
        // We need to return the original bet amount PLUS any profit
        // Because the original bet amount was already deducted when the bet was placed
        
        // Calculate total return (original bet + profit)
        const totalReturn = bet.amount * req.body.outcome.multiplier;
        
        console.log(`Bet completion - User ID: ${user.id}, Game: ${game.name}, Original bet: ${bet.amount}, Multiplier: ${req.body.outcome.multiplier}, Total return: ${totalReturn}`);
        
        // Update user's INR balance with the total return (original bet + profit)
        await storage.updateUserBalance(user.id, totalReturn, 'INR');
        
        // Add transaction record if available
        if (storage.createTransaction) {
          try {
            await storage.createTransaction({
              userId: user.id,
              type: 'WIN',
              amount: totalReturn,
              status: 'COMPLETED',
              currency: 'INR',
              description: `Win from ${game.name} - Multiplier: ${req.body.outcome.multiplier}x`,
            });
          } catch (err) {
            console.error('Error creating transaction record:', err);
            // Don't fail the whole request if transaction creation fails
          }
        }
      }
      
      res.json(updatedBet);
    } catch (error) {
      console.error('Error completing bet:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get('/api/bets/history', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Use the authenticated user's ID
      const userId = req.user.id;
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
      
      // Store user in session
      req.login(user, (err) => {
        if (err) {
          console.error('Session login error:', err);
          return res.status(500).json({ message: 'Error creating session' });
        }
        
        // Return user data without sensitive fields
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
      
      // Automatically log the user in after registration
      req.login(user, (err) => {
        if (err) {
          console.error('Session login error:', err);
          return res.status(500).json({ message: 'Error creating session' });
        }
        
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
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if the authenticated user is an admin
      const user = req.user;
      
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
      const { userId, amount, currency = 'INR' } = req.body;
      
      if (!userId || amount === undefined) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const updatedUser = await storage.setUserBalance(userId, amount, currency);
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

  // User Game Control routes for admin panel
  app.get('/api/admin/user-game-controls', isAdmin, async (req, res) => {
    try {
      const controls = await storage.getAllUserGameControls();
      res.json(controls);
    } catch (error) {
      console.error('Error getting user game controls:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/admin/user-game-controls/:userId', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const controls = await storage.getUserGameControls(userId);
      res.json(controls);
    } catch (error) {
      console.error('Error getting user game controls:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/admin/user-game-controls', isAdmin, async (req, res) => {
    try {
      const { userId, gameId, forceOutcome, outcomeType, durationGames, forcedOutcomeValue } = req.body;
      
      if (!userId || !gameId || forceOutcome === undefined || !outcomeType) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      const control = await storage.createUserGameControl({
        userId,
        gameId,
        forceOutcome,
        outcomeType,
        durationGames: durationGames || 1,
        forcedOutcomeValue
      });
      
      res.status(201).json(control);
    } catch (error) {
      console.error('Error creating user game control:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/admin/user-game-controls/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { forceOutcome, outcomeType, durationGames, forcedOutcomeValue } = req.body;
      
      const existingControl = await storage.getUserGameControl(id);
      if (!existingControl) {
        return res.status(404).json({ message: 'User game control not found' });
      }
      
      const updatedControl = await storage.updateUserGameControl(id, {
        forceOutcome,
        outcomeType,
        durationGames,
        forcedOutcomeValue
      });
      
      res.json(updatedControl);
    } catch (error) {
      console.error('Error updating user game control:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/admin/user-game-controls/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const deleted = await storage.deleteUserGameControl(id);
      if (!deleted) {
        return res.status(404).json({ message: 'User game control not found' });
      }
      
      res.json({ success: true, message: 'User game control deleted' });
    } catch (error) {
      console.error('Error deleting user game control:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/admin/reset-all-user-game-controls', isAdmin, async (req, res) => {
    try {
      const result = await storage.resetAllUserGameControls();
      res.json({ success: result, message: 'All user game controls have been reset' });
    } catch (error) {
      console.error('Error resetting user game controls:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time sports betting updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Keep track of clients and their subscriptions
  const clients = new Map<WebSocket, { topics: Set<string> }>();
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Initialize client data
    clients.set(ws, { topics: new Set() });
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        if (data.action === 'subscribe' && data.topic) {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.topics.add(data.topic);
            console.log(`Client subscribed to topic: ${data.topic}`);
          }
        } else if (data.action === 'unsubscribe' && data.topic) {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.topics.delete(data.topic);
            console.log(`Client unsubscribed from topic: ${data.topic}`);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      message: 'Successfully connected to the Stake sports betting WebSocket server'
    }));
  });
  
  // Setup function to broadcast messages to subscribed clients
  const broadcastToTopic = (topic: string, payload: any) => {
    clients.forEach((clientData, client) => {
      if (client.readyState === WebSocket.OPEN && clientData.topics.has(topic)) {
        client.send(JSON.stringify({
          topic,
          timestamp: Date.now(),
          payload
        }));
      }
    });
  };
  
  // Simulate live odds updates
  const simulateOddsChanges = () => {
    const sportCategories = ['soccer', 'basketball', 'tennis', 'cricket', 'american-football', 'baseball', 'ice-hockey', 'esports'];
    
    // Update odds every 5-15 seconds for random events
    setInterval(() => {
      const sportId = sportCategories[Math.floor(Math.random() * sportCategories.length)];
      const eventId = `event-${Math.floor(Math.random() * 5) + 1}`;
      const marketId = `market-${Math.floor(Math.random() * 7) + 1}`;
      const outcomeId = `outcome-${Math.floor(Math.random() * 17) + 1}`;
      
      // Generate a small change in odds (up or down)
      const direction = Math.random() > 0.5 ? 1 : -1;
      const change = direction * (Math.random() * 0.2 + 0.01); // Change between 0.01 and 0.21
      
      // Base odds between 1.5 and 4.0
      const baseOdds = Math.random() * 2.5 + 1.5;
      const newOdds = Math.max(1.01, parseFloat((baseOdds + change).toFixed(2)));
      
      // Create odds update
      const update = {
        sportId,
        eventId,
        marketId,
        outcomeId,
        odds: newOdds,
        timestamp: Date.now()
      };
      
      // Broadcast to specific topic and general sports updates
      broadcastToTopic(`odds.${sportId}`, update);
      broadcastToTopic('sports.odds.all', update);
      
      console.log(`Odds updated: ${sportId} - ${outcomeId} - new odds: ${newOdds}`);
    }, Math.floor(Math.random() * 10000) + 5000); // Random interval between 5-15 seconds
    
    // Simulate random match events (goals, points, etc.)
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of an event happening
        const sportId = sportCategories[Math.floor(Math.random() * sportCategories.length)];
        const eventId = `event-${Math.floor(Math.random() * 5) + 1}`;
        
        // Generate a game event
        const eventTypes: Record<string, string[]> = {
          'soccer': ['goal', 'yellow-card', 'red-card', 'corner', 'free-kick'],
          'basketball': ['2pt', '3pt', 'free-throw', 'block', 'steal'],
          'tennis': ['ace', 'fault', 'break-point', 'game-point', 'set-point'],
          'cricket': ['wicket', 'six', 'four', 'no-ball', 'wide'],
          'american-football': ['touchdown', 'field-goal', 'interception', 'fumble', 'sack'],
          'baseball': ['home-run', 'base-hit', 'strike', 'ball', 'out'],
          'ice-hockey': ['goal', 'penalty', 'power-play', 'save', 'assist'],
          'esports': ['kill', 'objective', 'ultimate', 'tower', 'baron']
        };
        
        const eventType = eventTypes[sportId]?.[Math.floor(Math.random() * 5)] || 'score';
        const teamIndex = Math.random() > 0.5 ? 'home' : 'away';
        
        const gameEvent = {
          sportId,
          eventId,
          type: eventType,
          team: teamIndex,
          time: Math.floor(Math.random() * 90) + 1,
          description: `${teamIndex === 'home' ? 'Home' : 'Away'} team ${eventType} at ${Math.floor(Math.random() * 90) + 1}'`,
          timestamp: Date.now()
        };
        
        // Broadcast to specific topic and general game events
        broadcastToTopic(`events.${sportId}.${eventId}`, gameEvent);
        broadcastToTopic('sports.events.all', gameEvent);
        
        console.log(`Game event: ${sportId} - ${eventId} - ${eventType}`);
      }
    }, 30000); // Check for events every 30 seconds
  };
  
  // Start simulating odds changes
  simulateOddsChanges();
  
  return httpServer;
}
