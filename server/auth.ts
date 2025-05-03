import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

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

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "extremely-secure-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        if (user.isBanned) {
          return done(null, false, { message: "Your account has been banned" });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      if (user.isBanned) {
        return done(new Error("Account is banned"));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register user endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { password, email, fullName, phone } = req.body;
      
      if (!password || !email || !fullName || !phone) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if email exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Generate a unique username based on the full name
      const baseUsername = generateUsernameFromFullName(fullName);
      let username = baseUsername;
      let counter = 1;
      
      // Check if the username exists and generate a new one with a number appended
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        phone
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't include the password in the response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      // Check for specific database constraint errors
      const err = error as any;
      if (err.code === '23505') { // PostgreSQL unique constraint violation
        if (err.constraint === 'users_email_unique') {
          return res.status(400).json({ message: "Email address already in use" });
        } else if (err.constraint === 'users_username_unique') {
          return res.status(400).json({ message: "Username already taken" });
        }
      }
      
      res.status(500).json({ message: "Server error" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't include the password in the response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't include the password in the response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}