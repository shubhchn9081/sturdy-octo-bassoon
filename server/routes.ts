import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertBetSchema, insertUserSchema, clientBetSchema } from "@shared/schema";
import { calculateCrashPoint, calculateDiceRoll, calculateLimboResult, createServerSeed, verifyBet } from "./games/provably-fair";
import { setupAuth } from "./auth";
import { setupDevEndpoints } from "./adminSetup";
// Import admin middleware (used later in the admin section)
import gameControlRoutes from "./routes/gameControl";
import apayRoutes from "./routes/apay";
import slotsRoutes from "./routes/slots";
import cupAndBallRoutes from "./routes/cup-and-ball";
import towerClimbRoutes from "./routes/tower-climb";
import crashCarRoutes, { setWebSocketServer as setCrashCarWebSocketServer } from "./routes/crashCar";
import diceTradingRoutes from "./routes/diceTrading";
import { setWebSocketServer, broadcastToTopic } from "./utils/websocket";

// Function to generate username from full name
function generateUsernameFromFullName(fullName: string): string {
  // Remove any special characters and spaces, convert to lowercase
  const cleanedName = fullName.toLowerCase()
    .replace(/[^\w\s]/gi, '')  // Remove any special characters
    .replace(/\s+/g, '');      // Remove spaces
  
  // Ensure it's not an empty string after cleaning
  if (cleanedName.length === 0) {
    return 'user' + Math.floor(Math.random() * 10000).toString();
  }
  
  // Return the cleaned name or a substring if it's too long
  return cleanedName.substring(0, Math.min(cleanedName.length, 15));
}

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
  
  // Setup game control routes 
  app.use('/api/game-control', gameControlRoutes);
  
  // Setup APay payment gateway routes
  app.use('/apay', apayRoutes);
  
  // Setup slots game routes
  app.use('/api/slots', slotsRoutes);
  
  // Setup cup and ball game routes
  app.use('/api/cup-and-ball', cupAndBallRoutes);
  
  // Setup tower climb game routes
  app.use('/api', towerClimbRoutes);
  
  // Setup crash car game routes
  app.use('/api/crash-car', crashCarRoutes);
  
  // Setup dice trading game routes
  app.use('/api/dice-trading', diceTradingRoutes);
  
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
          fullName: 'Demo User',
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
      
      // Add debug log to see the exact request structure
      console.log('BET AMOUNT DEBUG:', {
        path: req.path,
        amount: req.body.amount,
        betAmount: req.body.betAmount,
        rawBody: JSON.stringify(req.body)
      });
      
      // Import the bet utilities including our enhanced extractBetAmount function
      const { normalizeBetAmount, validateBetAmount, canonicalizeBetAmount, extractBetAmount } = await import('./utils/betUtils');
      
      // Validate request body
      // Use the client-side schema that doesn't include userId
      const betSchema = clientBetSchema.extend({
        options: z.record(z.any()).optional()
      });
      
      // Parse and validate the request
      let validatedData;
      try {
        validatedData = betSchema.parse(req.body);
      } catch (e) {
        if (e instanceof z.ZodError) {
          return res.status(400).json({ 
            message: 'Invalid bet data', 
            errors: e.errors,
            receivedData: req.body
          });
        }
        throw e;
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
      
      // First, extract the actual bet amount from the request, checking both direct
      // and nested values using our enhanced extraction function
      const extractedAmount = extractBetAmount(req.body);
      console.log('Extracted bet amount from request:', extractedAmount);
      
      // Use the larger of the extracted amount or the direct amount
      const originalAmount = validatedData.amount;
      
      // If the extracted amount is larger than the direct amount, use it instead
      if (extractedAmount > originalAmount) {
        console.log(`Found larger nested amount: ${extractedAmount} > ${originalAmount}, using nested amount`);
        validatedData.amount = extractedAmount;
      } else {
        // Otherwise, canonicalize the direct amount
        validatedData.amount = canonicalizeBetAmount(validatedData.amount);
      }
      
      // Log bet information with both original and final amounts
      console.log(`Placing bet - User: ${user.username}, Game: ${game.name}`);
      console.log(`Original amount: ${originalAmount}, Final bet amount: ${validatedData.amount}`);
      
      // Validate the bet amount
      const validation = validateBetAmount(validatedData.amount, minBet);
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.message,
          originalAmount: originalAmount,
          normalizedAmount: validatedData.amount,
          minBet: minBet
        });
      }
      
      // Generate server seed for provable fairness
      const serverSeed = createServerSeed();
      
      try {
        // First create the bet record with the properly normalized amount
        const bet = await storage.createBet({
          ...validatedData,
          userId: user.id, // Explicitly set userId from authenticated user
          serverSeed,
          nonce: 1,
          outcome: {}, // Empty outcome until bet is completed
        });
        
        // Explicitly log the bet creation
        console.log(`Created bet record: ID=${bet.id}, Game=${game.name}, Amount=${validatedData.amount}, User=${user.username}`);
        
        // Import and use the transaction handler to handle the bet deduction
        const { transactionHandler } = await import('./middleware/transactionHandler');
        const deductionSuccess = await transactionHandler.deductBetAmount(
          req, 
          res, 
          user.id, 
          validatedData.amount, // Pass the normalized amount
          currency, 
          game.name
        );
        
        // If deduction failed, we should delete the bet record
        if (!deductionSuccess) {
          // Try to delete the bet if possible
          if (storage.deleteBet) {
            await storage.deleteBet(bet.id);
          }
          console.error(`Bet amount deduction failed for bet ID=${bet.id}`);
          // The transaction handler already sent the response
          return;
        }
        
        console.log(`Successfully deducted ${validatedData.amount} ${currency} for bet ID=${bet.id}`);
        
        // Return the bet ID and details to the client
        res.json({ 
          betId: bet.id, 
          serverSeedHash: bet.serverSeed,
          amount: validatedData.amount, // Return the normalized amount
          originalAmount: originalAmount, // Also return the original amount for debugging
          success: true
        });
      } catch (error) {
        console.error('Error in bet creation process:', error);
        res.status(500).json({ 
          message: 'Error processing bet', 
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post('/api/bets/:id/complete', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Import the bet utilities
      const { normalizeBetAmount, calculateWinnings } = await import('./utils/betUtils');
      
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
      
      // Use our robust normalization for the multiplier
      const originalMultiplier = req.body.outcome.multiplier;
      req.body.outcome.multiplier = normalizeBetAmount(req.body.outcome.multiplier);
      
      // Ensure the multiplier is a valid number for wins
      if (req.body.outcome.win) {
        if (req.body.outcome.multiplier <= 0) {
          return res.status(400).json({ 
            message: 'Invalid multiplier value. Must be greater than 0.',
            originalMultiplier: originalMultiplier,
            normalizedMultiplier: req.body.outcome.multiplier
          });
        }
      }
      
      // Get profit value based on win/loss using our utility
      const profit = req.body.outcome.win 
        ? calculateWinnings(bet.amount, req.body.outcome.multiplier) - bet.amount 
        : -bet.amount;
      
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
        
        // Calculate total return (original bet amount * multiplier) using our utility
        const totalReturn = calculateWinnings(bet.amount, req.body.outcome.multiplier);
        
        console.log(`Bet completion - User ID: ${user.id}, Game: ${game.name}, Original bet: ${bet.amount}`);
        console.log(`Multiplier: ${originalMultiplier} (normalized: ${req.body.outcome.multiplier}), Total return: ${totalReturn}`);
        console.log(`Profit: ${profit}`);
        
        // Import and use the transaction handler for consistent processing
        const { transactionHandler } = await import('./middleware/transactionHandler');
        const processSuccess = await transactionHandler.processBetWin(
          req, 
          res, 
          user.id, 
          bet.amount,
          req.body.outcome.multiplier,
          'INR', 
          game.name
        );
        
        if (!processSuccess) {
          console.error(`Failed to process win for bet ID=${bet.id}`);
          // The transaction handler already sent an error response
          return;
        }
        
        console.log(`Successfully processed win of ${totalReturn} INR for bet ID=${bet.id}`);
        
        // Add transaction record if available
        // (transactionHandler already does this, but keeping for redundancy)
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
      
      // Add win amount to the response for easier client-side handling
      const responseData = {
        ...updatedBet,
        winAmount: req.body.outcome.win ? calculateWinnings(bet.amount, req.body.outcome.multiplier) : 0
      };
      
      res.json(responseData);
    } catch (error) {
      console.error('Error completing bet:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
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
          fullName: user.fullName,
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
      
      // Generate username from fullName
      const baseUsername = generateUsernameFromFullName(userData.fullName);
      let username = baseUsername;
      let counter = 1;
      
      // Check if the username exists and generate a new one with a number appended
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Create new user with the generated username
      const user = await storage.createUser({
        ...userData,
        username
      });
      
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
          fullName: user.fullName,
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

  // Global Game Control routes (affects all users)
  app.get('/api/admin/global-game-control', isAdmin, async (req, res) => {
    try {
      const control = await storage.getGlobalGameControl();
      res.json(control || { 
        forceAllUsersLose: false, 
        forceAllUsersWin: false, 
        affectedGames: [],
        targetMultiplier: 2.0,
        useExactMultiplier: false
      });
    } catch (error) {
      console.error('Error getting global game control:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/global-game-control/lose', isAdmin, async (req, res) => {
    try {
      const { affectedGames } = req.body;
      const control = await storage.makeAllUsersLose(affectedGames);
      res.json(control);
    } catch (error) {
      console.error('Error setting global lose control:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/global-game-control/win', isAdmin, async (req, res) => {
    try {
      const { affectedGames, targetMultiplier, useExactMultiplier } = req.body;
      // Default to 2.0 multiplier if not specified
      const finalTargetMultiplier = targetMultiplier !== undefined ? targetMultiplier : 2.0;
      // Default to false for exact multiplier if not specified
      const finalUseExactMultiplier = useExactMultiplier !== undefined ? useExactMultiplier : false;
      
      // Update storage with these settings
      const control = await storage.makeAllUsersWin(affectedGames, finalTargetMultiplier, finalUseExactMultiplier);
      res.json(control);
    } catch (error) {
      console.error('Error setting global win control:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/admin/global-game-control/reset', isAdmin, async (req, res) => {
    try {
      const control = await storage.resetGlobalGameControl();
      res.json(control);
    } catch (error) {
      console.error('Error resetting global game control:', error);
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
  
  // Admin transaction endpoints
  app.get('/api/admin/transactions', isAdmin, async (req, res) => {
    try {
      const type = req.query.type as string;
      let transactions;
      
      if (type === 'WITHDRAWAL') {
        transactions = await storage.getWithdrawalTransactions();
      } else if (type) {
        // If type is specified but not WITHDRAWAL, filter by that type
        transactions = await storage.getAllTransactions();
        transactions = transactions.filter(t => t.type.toUpperCase() === type.toUpperCase());
      } else {
        // If no type is specified, return all transactions
        transactions = await storage.getAllTransactions();
      }
      
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching admin transactions:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.post('/api/admin/transactions/:id/approve', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      if (transaction.type !== 'withdrawal') {
        return res.status(400).json({ message: 'Only withdrawal transactions can be approved' });
      }
      
      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending transactions can be approved' });
      }
      
      // Update transaction status
      const updatedTransaction = await storage.updateTransactionStatus(id, 'completed');
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.post('/api/admin/transactions/:id/reject', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      if (transaction.type !== 'withdrawal') {
        return res.status(400).json({ message: 'Only withdrawal transactions can be rejected' });
      }
      
      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending transactions can be rejected' });
      }
      
      // Update transaction status
      const updatedTransaction = await storage.updateTransactionStatus(id, 'rejected');
      
      // Return the funds to the user's balance
      if (transaction.userId) {
        await storage.updateUserBalance(transaction.userId, transaction.amount, transaction.currency);
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Admin endpoint to get bet history for any user
  app.get('/api/admin/bets', isAdmin, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      
      // If userId is specified, get bets for that user
      if (userId) {
        const bets = await storage.getBetHistory(userId, gameId);
        return res.json(bets);
      }
      
      // If no userId specified, collect all bets
      // This is a basic implementation and might need pagination for large datasets
      const users = await storage.getAllUsers();
      let allBets: any[] = [];
      
      // Get bets for each user
      for (const user of users) {
        const userBets = await storage.getBetHistory(user.id, gameId);
        allBets = [...allBets, ...userBets];
      }
      
      // Sort all bets by date (newest first)
      allBets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // If looking for a specific user (ID 1039), log their bets for debugging
      if (userId === 1039) {
        console.log(`Detailed logs for user ID 1039 bets:`, JSON.stringify(allBets, null, 2));
      }
      
      res.json(allBets);
    } catch (error) {
      console.error('Error getting admin bet history:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // New endpoint to get all user activities (bets, deposits, withdrawals)
  app.get('/api/admin/user-activities', isAdmin, async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      const activityType = req.query.type as string | undefined;
      
      // Initialize arrays for different activity types
      let bets: any[] = [];
      let transactions: any[] = [];
      let allActivities: any[] = [];
      
      // Get users to work with
      const users = userId ? [await storage.getUser(userId)].filter(Boolean) as any[] : await storage.getAllUsers();
      
      // If no valid users, return empty array
      if (!users || users.length === 0) {
        return res.json([]);
      }
      
      // Process each activity type based on filter
      const includeTypes = activityType ? [activityType] : ['bet', 'deposit', 'withdrawal'];
      
      // Fetch bet data if needed
      if (includeTypes.includes('bet')) {
        for (const user of users) {
          if (!user) continue;
          const userBets = await storage.getBetHistory(user.id, gameId);
          
          // Transform bets to have consistent activity format
          const formattedBets = userBets.map(bet => ({
            id: `bet-${bet.id}`,
            userId: bet.userId,
            username: user.username,
            type: 'bet',
            gameId: bet.gameId,
            gameName: bet.gameId.toString(), // We'll populate this later
            amount: bet.amount,
            currency: 'INR', // Default currency
            status: bet.completed ? 'completed' : 'pending',
            outcome: bet.profit && bet.profit > 0 ? 'win' : 'loss',
            profit: bet.profit,
            multiplier: bet.multiplier,
            createdAt: bet.createdAt,
            details: bet
          }));
          
          bets = [...bets, ...formattedBets];
        }
      }
      
      // Fetch transactions if needed
      if (includeTypes.includes('deposit') || includeTypes.includes('withdrawal')) {
        for (const user of users) {
          if (!user) continue;
          const userTransactions = await storage.getUserTransactions(user.id);
          
          // Filter transactions by type if needed
          const filteredTransactions = userTransactions.filter(tx => {
            if (includeTypes.includes('deposit') && tx.type.includes('deposit')) return true;
            if (includeTypes.includes('withdrawal') && tx.type.includes('withdrawal')) return true;
            return false;
          });
          
          // Transform transactions to have consistent activity format
          const formattedTransactions = filteredTransactions.map(tx => ({
            id: `tx-${tx.id}`,
            userId: tx.userId,
            username: user.username,
            type: tx.type,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            createdAt: tx.createdAt,
            description: tx.description,
            txid: tx.txid,
            details: tx
          }));
          
          transactions = [...transactions, ...formattedTransactions];
        }
      }
      
      // Combine all activities
      allActivities = [...bets, ...transactions];
      
      // Get games for lookup to populate game names
      const games = await storage.getAllGames();
      const gameMap = games.reduce((map, game) => {
        map[game.id] = game.name;
        return map;
      }, {} as Record<number, string>);
      
      // Populate game names for bets
      allActivities = allActivities.map(activity => {
        if (activity.type === 'bet' && activity.gameId && gameMap[activity.gameId]) {
          return { ...activity, gameName: gameMap[activity.gameId] };
        }
        return activity;
      });
      
      // Sort by most recent first
      allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allActivities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
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

  // User Game Access Routes
  app.get('/api/admin/user-game-access', isAdmin, async (req, res) => {
    try {
      const accessRecords = await storage.getAllUserGameAccess();
      res.json(accessRecords);
    } catch (error) {
      console.error('Error getting user game access records:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/admin/user-game-access/:userId', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const access = await storage.getUserGameAccess(userId);
      
      if (!access) {
        return res.status(404).json({ message: 'User game access not found' });
      }
      
      res.json(access);
    } catch (error) {
      console.error('Error getting user game access:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/admin/user-game-access', isAdmin, async (req, res) => {
    try {
      const { userId, accessType, allowedGameIds } = req.body;
      
      if (!userId || !accessType) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If accessType is 'specific_games', ensure allowedGameIds is provided
      if (accessType === 'specific_games' && (!allowedGameIds || !Array.isArray(allowedGameIds))) {
        return res.status(400).json({ message: 'allowedGameIds must be an array when accessType is specific_games' });
      }
      
      // Create or update user game access
      const access = await storage.updateUserGameAccess(userId, {
        accessType,
        allowedGameIds: accessType === 'specific_games' ? allowedGameIds : []
      });
      
      res.json(access);
    } catch (error) {
      console.error('Error creating/updating user game access:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Add an endpoint to check if a user has access to a specific game
  app.get('/api/games/:gameId/check-access', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = req.user!.id;
      const gameId = parseInt(req.params.gameId);
      
      const hasAccess = await storage.checkUserGameAccess(userId, gameId);
      
      res.json({ hasAccess });
    } catch (error) {
      console.error('Error checking game access:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time game updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Initialize the WebSocket server with our utility
  setWebSocketServer(wss);
  
  // Initialize the crash car game with the WebSocket server
  setCrashCarWebSocketServer(wss, broadcastToTopic);
  
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
