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
- **Google Authentication**: OAuth 2.0 authentication with Google
- **Checklist**: Protected checklist feature with auto-reset
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

2. Set up Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3001/api/auth/google/callback`
     - For production: `https://your-backend-url.railway.app/api/auth/google/callback`
   - Copy the Client ID and Client Secret

3. Create a `.env` file in the `backend` directory:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret-key
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
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

### Setting Up Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the **Variables** tab
4. Add the following environment variables:

**Required Variables:**
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `SESSION_SECRET`: A random secret key for session encryption (generate a strong random string)
- `FRONTEND_URL`: Your frontend URL (e.g., `https://your-frontend.railway.app` or `http://localhost:3000` for local)
- `BACKEND_URL`: Your backend URL (e.g., `https://your-backend.railway.app`)

**Optional Variables:**
- `GOOGLE_CALLBACK_URL`: Full callback URL (if not set, will be constructed from BACKEND_URL)
- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Port number (Railway sets this automatically)

**Important:** After setting up Google OAuth credentials, make sure to add your Railway callback URL to Google Cloud Console:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to **APIs & Services** → **Credentials**
- Click on your OAuth 2.0 Client ID
- Under **Authorized redirect URIs**, add: `https://your-backend.railway.app/api/auth/google/callback`
- Replace `your-backend.railway.app` with your actual Railway backend URL

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

#### Backend Environment Variables:
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `SESSION_SECRET`: A random secret key for session encryption (use a strong random string)
- `FRONTEND_URL`: Frontend URL (e.g., `http://localhost:3000` for dev, `https://your-frontend.railway.app` for prod)
- `BACKEND_URL`: Backend URL (e.g., `http://localhost:3001` for dev, `https://your-backend.railway.app` for prod)
- `GOOGLE_CALLBACK_URL`: (Optional) Full callback URL. If not set, will be constructed from BACKEND_URL
- `NODE_ENV`: Set to `production` for production deployment

#### Frontend Environment Variables:
- `VITE_API_URL`: The URL of your backend API (e.g., `http://localhost:3001` for dev, `https://your-backend.railway.app` for prod)

The frontend will use this to fetch data from the backend.

## API Endpoints

### Public Endpoints:
- `GET /api/hello` - Returns a JSON message: `{ "message": "Hello World from Express!" }`
- `GET /health` - Health check endpoint
- `GET /api/auth/google` - Initiates Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback (handled automatically)
- `GET /api/auth/status` - Check authentication status
- `GET /api/auth/logout` - Logout user

### Protected Endpoints (require authentication):
- `GET /api/checklist` - Get checklist state
- `PUT /api/checklist` - Update checklist item

## Technologies Used

- **Backend**: Node.js, Express, CORS
- **Frontend**: React, Vite
- **Deployment**: Railway-ready configuration
