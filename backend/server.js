import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Hello World endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World from Express!' });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
