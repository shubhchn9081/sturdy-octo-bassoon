import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Add validation for the registration form
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function setupAuth(app: Express) {
  // Session setup - secure in production
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-prod",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  if (isProduction) {
    app.set("trust proxy", 1);
  }
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy({
      usernameField: 'username', // can be either username or email
    }, async (username, password, done) => {
      try {
        // Check if input is an email
        const isEmail = username.includes('@');
        
        // Attempt to find user by username or email
        const user = isEmail 
          ? await storage.getUserByEmail(username)
          : await storage.getUserByUsername(username);
          
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Demo authentication - for demo_user, just check if the password matches directly
        if (user.username === 'demo_user') {
          if (password !== user.password) {
            return done(null, false, { message: "Invalid username or password" });
          }
        } else {
          // For regular users, use password hashing
          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid username or password" });
          }
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      // Validate the request body
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }
      
      const userData = validationResult.data;
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create the user without the confirm password field
      const { confirmPassword, ...userDataToSave } = userData;
      
      const user = await storage.createUser({
        ...userDataToSave,
        password: hashedPassword,
      });
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error logging in after registration",
          });
        }
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json({
          success: true,
          user: userWithoutPassword,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during registration",
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Special development login - bypass auth for "demo_user"
    if (req.body.username === "demo_user" && req.body.password === "demo123456") {
      // Create a demo user object
      const demoUser = {
        id: 1,
        username: "demo_user",
        email: "demo@example.com",
        balance: 1000,
        dateOfBirth: new Date("1990-01-01"),
        phone: null,
        referralCode: null,
        language: "English",
        createdAt: new Date()
      };
      
      req.login(demoUser, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.json({
          success: true,
          user: demoUser,
        });
      });
      return;
    }
    
    // Regular authentication flow
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Invalid credentials",
        });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.json({
          success: true,
          user: userWithoutPassword,
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error during logout",
        });
      }
      
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Return the user without the password
    const { password, ...userWithoutPassword } = req.user as Express.User;
    res.json(userWithoutPassword);
  });
}