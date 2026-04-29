# OCR Project - Local Development Setup

This guide explains how to run the entire OCR project locally on your machine.

## Prerequisites

Before starting, make sure you have installed:
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Tesseract OCR** - [Download](https://github.com/UB-Mannheim/tesseract/wiki)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```powershell
python --version
node --version
npm --version
tesseract --version
```

---

## Project Structure

```
ocr-project/
├── backend/              # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── serviceAccountKey.json  (Firebase credentials)
├── frontend/             # React frontend
│   ├── src/
│   ├── package.json
│   └── .env.local (optional)
└── README.md
```

---

## Step 1: Clone Repository

```powershell
git clone https://github.com/DigiKaran/OCR.git
cd OCR
```

---

## Step 2: Setup Firebase Credentials

1. Get `serviceAccountKey.json` from [Firebase Console](https://console.firebase.google.com/)
2. Place it in: `backend/serviceAccountKey.json`

---

## Step 3: Start Backend (Terminal 1)

```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

✅ **Backend URL:** `http://localhost:8000`
✅ **API Docs:** `http://localhost:8000/docs`

---

## Step 4: Start Frontend (Terminal 2)

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

✅ **Frontend URL:** `http://localhost:5173`

---

## Step 5: Test the Application

1. **Open browser:** `http://localhost:5173`
2. **Login** with Firebase credentials
3. **Upload an image** for OCR scanning
4. **Test features:**
   - ✅ Image preprocessing
   - ✅ Text extraction (OCR)
   - ✅ Text editing
   - ✅ Export (PDF, DOCX, TXT)
   - ✅ Save edits to database

---

## Architecture

```
┌─────────────────┐
│   Browser       │ http://localhost:5173
│  (React App)    │
└────────┬────────┘
         │ HTTP calls to /api
         ↓
┌─────────────────────────────────────┐
│  FastAPI Backend                    │ http://localhost:8000
│  • OCR Processing (Tesseract)       │
│  • Image Preprocessing (OpenCV)     │
│  • Export Services (PDF/DOCX/TXT)   │
└────────┬────────────────────────────┘
         │ Firebase Admin SDK
         ↓
┌─────────────────────────────────────┐
│  Firebase Firestore                 │
│  • User Scans Storage               │
│  • Extracted Text + Edits           │
└─────────────────────────────────────┘
```

---

## Environment Variables

### Backend (Optional - uses defaults)

Create `backend/.env`:
```env
TESSERACT_PATH=/usr/bin/tesseract
FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
```

### Frontend (Optional)

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## API Endpoints

### OCR Operations

**Upload Image & Extract Text**
```
POST /api/ocr/scan
Content-Type: multipart/form-data

Body: image file
Response: { id, file_name, extracted_text, confidence_score }
```

**Update Edited Text**
```
PUT /api/ocr/scan/{scan_id}
Content-Type: application/json

Body: { edited_text: "updated text" }
```

**Export Document**
```
GET /api/ocr/export/{scan_id}/{format}

Parameters:
  format: pdf | docx | txt

Response: Binary file download
```

### History Operations

**Get All Scans**
```
GET /api/history/
Response: [ { id, file_name, extracted_text, confidence_score, ... } ]
```

**Get Specific Scan**
```
GET /api/history/{scan_id}
Response: { id, file_name, extracted_text, confidence_score, ... }
```

**Delete Scan**
```
DELETE /api/history/{scan_id}
Response: { message: "Scan deleted" }
```

---

## Features

### ✅ Working Features

- [x] User Authentication (Firebase)
- [x] Image Upload
- [x] High-Accuracy OCR (Tesseract OEM 3)
- [x] Advanced Image Preprocessing (CLAHE, filtering)
- [x] Text Editing with Rich Editor
- [x] Export to Multiple Formats (PDF, DOCX, TXT)
- [x] Scan History Management
- [x] Confidence Scoring
- [x] Full Responsive Design
- [x] Error Handling & Validation

---

## Common Issues & Solutions

### Issue: Tesseract Not Found

**Solution:**
```powershell
# Windows
choco install tesseract  # or download from link above

# Linux
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### Issue: Port Already in Use

**Backend (Port 8000):**
```powershell
python -m uvicorn main:app --reload --port 8001
# Then update frontend API URL
```

**Frontend (Port 5173):**
```powershell
npm run dev -- --port 5174
```

### Issue: Firebase Authentication Error

1. Check `serviceAccountKey.json` exists in `backend/`
2. Verify Firebase project ID matches
3. Check Firestore database permissions
4. Restart backend after changing credentials

### Issue: npm Install Fails

```powershell
# Clear npm cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps

# Try again
npm run dev
```

### Issue: White Screen on Frontend

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for API calls
4. Verify backend is running on `:8000`

---

## Stopping Services

**Stop Backend:**
```powershell
# In backend terminal, press: Ctrl+C
```

**Stop Frontend:**
```powershell
# In frontend terminal, press: Ctrl+C
```

---

## Production Deployment

### Backend (Render)
- URL: `https://ocr-u72s.onrender.com`
- API Docs: `https://ocr-u72s.onrender.com/docs`

### Frontend (Vercel)
- URL: Check your Vercel dashboard for the production URL

---

## File Structure

```
backend/
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Python dependencies
├── serviceAccountKey.json       # Firebase credentials
├── Dockerfile                   # Docker configuration
├── api/
│   ├── routes/
│   │   ├── ocr.py              # OCR endpoints
│   │   └── scans.py            # History endpoints
│   └── deps.py                 # Dependencies
├── services/
│   ├── ocr_service.py          # Tesseract OCR logic
│   └── export_service.py       # PDF/DOCX/TXT export
├── core/
│   ├── config.py               # Configuration
│   └── firebase.py             # Firebase setup
└── models/
    └── schemas.py              # Pydantic schemas

frontend/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Main layout
│   ├── pages/
│   │   ├── AuthPage.tsx
│   │   ├── Dashboard.tsx       # Upload page
│   │   ├── ResultPage.tsx      # Editor page
│   │   ├── HistoryPage.tsx
│   │   └── LandingPage.tsx
│   ├── lib/
│   │   ├── axios.ts            # API client
│   │   └── firebase.ts         # Firebase config
│   ├── store/
│   │   └── authStore.ts        # Zustand auth state
│   ├── App.tsx                 # Routes
│   └── main.tsx                # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Useful Commands

### Backend
```powershell
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
python -m uvicorn main:app --reload --port 8000

# Run with specific host
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# View API docs
# Visit: http://localhost:8000/docs
```

### Frontend
```powershell
# Install dependencies (with legacy peer deps)
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## Testing Workflow

1. **Login** - Use Firebase credentials
2. **Upload Image** - Try different image formats (PNG, JPG, PDF)
3. **View Result** - Check extracted text accuracy
4. **Edit Text** - Make corrections in the editor
5. **Save Edits** - Verify changes are saved
6. **Export** - Download as PDF/DOCX/TXT
7. **View History** - Check scan history
8. **Delete Scan** - Test deletion functionality

---

## Database (Firebase Firestore)

### Collections

**users**
```
user_id (document ID)
├── email
├── created_at
└── updated_at
```

**scans**
```
scan_id (document ID)
├── user_id (reference)
├── file_name
├── extracted_text
├── edited_text
├── confidence_score
├── created_at
└── updated_at
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review [GitHub Issues](https://github.com/DigiKaran/OCR/issues)
3. Check backend logs: Terminal 1
4. Check browser console: F12 in DevTools

---

## License

This project is open source and available under the MIT License.

---

**Happy coding! 🚀**
