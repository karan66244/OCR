# PrecisionOCR - Full-Stack OCR Platform

PrecisionOCR is a robust, production-ready optical character recognition web application. It extracts text from images and documents using Tesseract OCR, processes images with OpenCV, and provides a sleek React-based UI for managing and exporting scanned data.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, Zustand, React Router, Firebase Auth
- **Backend**: Python, FastAPI, Tesseract OCR, OpenCV, Firebase Admin, Firestore
- **Deployment**: Docker, Render (Backend), Vercel/Netlify (Frontend)

## Prerequisites
- Docker & Docker Compose (for backend)
- Node.js (v18+) & npm
- Firebase Project with Authentication (Email/Password) and Firestore Database enabled.

## Setup Instructions

### 1. Firebase Configuration
1. Go to the Firebase Console and create a project.
2. Enable **Authentication** (Email/Password provider).
3. Enable **Firestore Database** (Start in test mode or set up appropriate security rules).
4. Go to **Project Settings > Service Accounts** and generate a new private key. Save this file as `backend/serviceAccountKey.json`.
5. Go to **Project Settings > General** and add a Web App. Copy the config values to the frontend `.env`.

### 2. Backend Setup
1. Open the `backend/` directory.
2. Create `backend/.env`:
   ```
   FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
   ```
3. Run with Docker from the project root:
   ```bash
   docker-compose up --build
   ```
   The backend API will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Open the `frontend/` directory.
2. Create `frontend/.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:8000/api
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

## Deployment

### Backend (Render)
1. Push this repository to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your repository.
4. Render will automatically detect the `Dockerfile` in the repository root. Ensure the **Root Directory** is set to `backend` or adjust the build context if needed.
5. Set environment variables (e.g., provide your Firebase credentials via a secret file or base64 encoded env var).

### Frontend (Vercel/Netlify)
1. Connect your repository to Vercel/Netlify.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add the `VITE_FIREBASE_*` environment variables.
4. Deploy!
