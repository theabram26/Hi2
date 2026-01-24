import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow credentials for cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy - only initialize if credentials are provided
const googleClientID = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientID && googleClientSecret) {
  const getCallbackURL = () => {
    if (process.env.GOOGLE_CALLBACK_URL) {
      return process.env.GOOGLE_CALLBACK_URL;
    }
    const baseURL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const callbackURL = `${baseURL}/api/auth/google/callback`;
    console.log('Google OAuth Callback URL:', callbackURL);
    return callbackURL;
  };

  passport.use(new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: getCallbackURL()
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));

  console.log('Google OAuth configured successfully');
} else {
  console.warn('WARNING: Google OAuth credentials not found. Authentication will not work.');
  console.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Checklist state storage
let checklistState = {
  'do a': false,
  'do b': false,
  'do c': false
};

let lastResetTime = new Date().toISOString();

// Reset function
const resetChecklist = () => {
  checklistState = {
    'do a': false,
    'do b': false,
    'do c': false
  };
  lastResetTime = new Date().toISOString();
  console.log('Checklist reset at', lastResetTime);
};

// Calculate time until next minute boundary (:00 seconds)
const scheduleNextReset = () => {
  const now = new Date();
  const secondsUntilNextMinute = 60 - now.getSeconds();
  const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000;
  
  setTimeout(() => {
    resetChecklist();
    // Then reset every minute after that
    setInterval(resetChecklist, 60000);
  }, millisecondsUntilNextMinute);
};

// Start the reset schedule
scheduleNextReset();

// Authentication routes - only register if Google OAuth is configured
if (googleClientID && googleClientSecret) {
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Redirect to frontend after successful login
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}?auth=success`);
    }
  );
} else {
  // Provide error endpoints if OAuth is not configured
  app.get('/api/auth/google', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' });
  });

  app.get('/api/auth/google/callback', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured.' });
  });
}

app.get('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        displayName: req.user.displayName,
        email: req.user.emails?.[0]?.value,
        photo: req.user.photos?.[0]?.value
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Get checklist state (protected)
app.get('/api/checklist', isAuthenticated, (req, res) => {
  res.json({
    ...checklistState,
    lastResetTime
  });
});

// Update checklist item (protected)
app.put('/api/checklist', isAuthenticated, (req, res) => {
  const { item, checked } = req.body;
  
  if (item && typeof checked === 'boolean' && checklistState.hasOwnProperty(item)) {
    checklistState[item] = checked;
    res.json({ 
      success: true, 
      state: {
        ...checklistState,
        lastResetTime
      }
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid request' });
  }
});

// Hello World endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World from Express!' });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the React app (only in production)
const frontendPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendPath));
  
  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
