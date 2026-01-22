# Hello World Full-Stack App

A simple full-stack Hello World application with a Node.js/Express backend and a React (Vite) frontend.

## Project Structure

```
.
├── backend/          # Express API server
│   ├── server.js    # Main server file
│   └── package.json
├── frontend/        # React Vite app
│   ├── src/
│   ├── index.html
│   └── package.json
└── package.json     # Root package.json for convenience scripts
```

## Features

- **Backend**: Express server with `/api/hello` endpoint
- **Frontend**: React app that fetches and displays the message
- **CORS**: Enabled for cross-origin requests
- **Railway Ready**: Simple structure for easy deployment

## Local Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Setup

1. Install dependencies for both backend and frontend:
```bash
npm run install:all
```

2. Start the backend server (in one terminal):
```bash
npm run dev:backend
```
The backend will run on `http://localhost:3001`

3. Start the frontend dev server (in another terminal):
```bash
npm run dev:frontend
```
The frontend will run on `http://localhost:3000`

4. Open your browser and navigate to `http://localhost:3000`

## Deployment to Railway

### Option 1: Deploy Backend and Frontend Separately

#### Backend Deployment:
1. Create a new Railway project
2. Connect your repository
3. Set the root directory to `backend`
4. Set the start command to `npm start`
5. Railway will automatically detect Node.js and install dependencies

#### Frontend Deployment:
1. Create another Railway project (or use a monorepo setup)
2. Connect your repository
3. Set the root directory to `frontend`
4. Set the build command to `npm run build`
5. Set the start command to `npm run preview` (or use a static file server)
6. Set environment variable `VITE_API_URL` to your backend URL (e.g., `https://your-backend.railway.app`)

### Option 2: Deploy as Monorepo (Recommended)

1. Create a Railway project
2. Connect your repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set start command: `cd backend && npm install && npm start`
5. Railway will serve the built frontend from the backend (you may need to add static file serving)

### Environment Variables

For production, set the following environment variable:
- `VITE_API_URL`: The URL of your backend API (e.g., `https://your-backend.railway.app`)

The frontend will use this to fetch data from the backend.

## API Endpoints

- `GET /api/hello` - Returns a JSON message: `{ "message": "Hello World from Express!" }`
- `GET /health` - Health check endpoint

## Technologies Used

- **Backend**: Node.js, Express, CORS
- **Frontend**: React, Vite
- **Deployment**: Railway-ready configuration
