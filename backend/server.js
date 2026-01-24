import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

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

// Get checklist state
app.get('/api/checklist', (req, res) => {
  res.json({
    ...checklistState,
    lastResetTime
  });
});

// Update checklist item
app.put('/api/checklist', (req, res) => {
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
