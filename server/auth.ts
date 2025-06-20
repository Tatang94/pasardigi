import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as DbUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      isAdmin: boolean;
    }
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
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development to avoid persistence issues
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-here-dev-only",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: undefined
    },
    rolling: true,
    name: 'connect.sid'
  };

  app.set("trust proxy", 1);
  
  // CORS middleware for cookies - must be before session middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log("LocalStrategy: Attempting login for email:", email);
          const user = await storage.getUserByEmail(email);
          console.log("LocalStrategy: Found user:", user ? "Yes" : "No");
          
          if (!user) {
            console.log("LocalStrategy: User not found");
            return done(null, false, { message: "Email atau password salah" });
          }
          
          console.log("LocalStrategy: Comparing passwords");
          const passwordMatch = await comparePasswords(password, user.password);
          console.log("LocalStrategy: Password match:", passwordMatch);
          
          if (!passwordMatch) {
            console.log("LocalStrategy: Password mismatch");
            return done(null, false, { message: "Email atau password salah" });
          }
          
          const userObj = {
            id: user.id,
            email: user.email,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            phoneNumber: user.phoneNumber || undefined,
            isAdmin: user.isAdmin || false
          };
          console.log("LocalStrategy: Login successful, returning user:", userObj);
          return done(null, userObj);
        } catch (error) {
          console.error("LocalStrategy: Error during authentication:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        const userObj = {
          id: user.id,
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          phoneNumber: user.phoneNumber || undefined,
          isAdmin: user.isAdmin || false
        };
        done(null, userObj);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        isAdmin: false,
        isVerified: false,
      });

      // Auto login after register
      req.login({
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        phoneNumber: user.phoneNumber || undefined,
        isAdmin: user.isAdmin || false
      }, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin,
        });
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Terjadi kesalahan saat mendaftar" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", req.body);
    passport.authenticate("local", (err: any, user: Express.User, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
      }
      if (!user) {
        console.log("Login failed:", info);
        return res.status(401).json({ message: info?.message || "Login gagal" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Session login error:", err);
          return res.status(500).json({ message: "Terjadi kesalahan saat login" });
        }
        console.log("Login successful for user:", user.email);
        console.log("Session after login:", req.session);
        console.log("User in session:", req.user);
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin,
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) console.error("Session destroy error:", destroyErr);
        res.clearCookie('connect.sid');
        res.json({ message: "Logout berhasil" });
      });
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as Express.User;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
    });
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};