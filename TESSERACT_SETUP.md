# Tesseract OCR - Local Installation & Configuration Guide

This guide covers installing Tesseract OCR on Windows and configuring it with your OCR project.

---

## What is Tesseract?

Tesseract is an open-source OCR (Optical Character Recognition) engine that converts images/scans into text. It's highly accurate and supports 100+ languages.

---

## Installation on Windows

### Option 1: Automatic Installation (Recommended)

#### Using Chocolatey (Easiest)

**Prerequisites:** Install Chocolatey first

1. Open **PowerShell as Administrator**
2. Run this command:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr -useb community.chocolatey.org/install.ps1 | iex
```

3. **Install Tesseract:**
```powershell
choco install tesseract
```

4. **Verify Installation:**
```powershell
tesseract --version
```

✅ Should show: `tesseract 5.x.x`

---

### Option 2: Manual Installation

1. **Download Installer**
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download: `tesseract-ocr-w64-setup-v5.x.x.exe` (latest version)

2. **Run Installer**
   - Double-click the `.exe` file
   - Click **Install**
   - **IMPORTANT:** Note the installation path (default: `C:\Program Files\Tesseract-OCR`)

3. **Verify Installation**
   - Open PowerShell
   - Run:
   ```powershell
   tesseract --version
   ```

4. ✅ If you see version info, installation was successful!

---

## Configuration with OCR Project

### Step 1: Verify Tesseract Path

Your installation path is likely one of these:

**Windows (Default):**
```
C:\Program Files\Tesseract-OCR
```

**Windows (Alternative):**
```
C:\Program Files (x86)\Tesseract-OCR
```

**Verify which one:**
```powershell
# Check if tesseract exists in default location
Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe"

# Output: True (exists) or False (doesn't exist)
```

---

### Step 2: Configure Project

#### Option A: Auto-Detection (Recommended - No Setup Needed!)

The project automatically detects Tesseract:

**File:** `backend/core/config.py`
```python
import platform

TESSERACT_PATH = (
    "/usr/bin/tesseract" if platform.system() != "Windows"
    else r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)
```

✅ **This auto-detects your OS and sets the correct path!**

---

#### Option B: Manual Configuration

If auto-detection doesn't work, set it manually:

**Create or edit:** `backend/.env`
```env
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

**Or in Python code - edit `backend/core/config.py`:**
```python
class Settings(BaseSettings):
    TESSERACT_PATH: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

---

### Step 3: Add to System PATH (Optional but Recommended)

This allows you to run `tesseract` from any terminal without specifying the full path.

**Windows Steps:**

1. Press **Win + R**
2. Type: `sysdm.cpl`
3. Click **Environment Variables** button
4. Under "User variables" or "System variables", click **New**
   - **Variable name:** PATH
   - **Variable value:** `C:\Program Files\Tesseract-OCR`
5. Click **OK**
6. **Restart PowerShell**
7. Test:
```powershell
tesseract --version
```

✅ Should work from any terminal now!

---

## Verify Configuration

### Test 1: Direct Command

```powershell
tesseract --version
```

**Expected output:**
```
tesseract 5.2.0
 leptonica-1.81.1
  libgif 5.2.1 : libjpeg 9d (libjpeg-turbo 2.1.0) : libpng 1.6.37 : libtiff 4.3.0 : zlib 1.2.11
  Found AVX2
  Found AVX
  Found SSE4.1
```

### Test 2: Simple OCR Test

Create a test image or use an existing one, then:

```powershell
tesseract "path/to/image.png" output
```

This should create `output.txt` with extracted text.

### Test 3: Python Integration

Run this Python script to test with your project:

```python
import pytesseract
from PIL import Image

# Test if pytesseract can find tesseract
try:
    # Simple test
    text = pytesseract.image_to_string(Image.open("test.png"))
    print("✅ Tesseract is working!")
    print("Extracted text:", text)
except Exception as e:
    print("❌ Error:", e)
    print("Make sure tesseract is installed and in PATH")
```

---

## Configuration Verification in Project

### Check if Backend Finds Tesseract

1. **Start backend:**
```powershell
cd backend
python -m uvicorn main:app --reload
```

2. **Check logs** - You should NOT see tesseract errors like:
```
OSError: tesseract is not installed or it's not in your PATH
```

3. **If you see the error:**
   - Verify installation: `tesseract --version`
   - Add path to `.env` file
   - Restart backend

### Test via API

1. **Start backend:** (if not already running)
```powershell
python -m uvicorn main:app --reload
```

2. **Open browser:** `http://localhost:8000/docs`

3. **Try uploading a test image via `/ocr/scan` endpoint**

4. **Check response** - Should show extracted text with confidence score

---

## Troubleshooting

### Issue 1: "tesseract is not installed"

**Solution:**
```powershell
# Verify installation
tesseract --version

# If not found, reinstall:
# Option 1: Using Chocolatey
choco install tesseract

# Option 2: Manual - Download and run installer from:
# https://github.com/UB-Mannheim/tesseract/wiki
```

### Issue 2: "tesseract is not in your PATH"

**Solution:**
1. Add to system PATH (see Step 3 above)
2. Or set `TESSERACT_PATH` in `.env`:
```env
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```
3. Restart backend

### Issue 3: Wrong Installation Path

**Find your Tesseract installation:**
```powershell
# Try common locations
Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe"
Test-Path "C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
Test-Path "C:\tesseract\tesseract.exe"

# Or search using Windows
Get-ChildItem -Path "C:\" -Filter "tesseract.exe" -Recurse
```

**Update path in `.env`:**
```env
TESSERACT_PATH=C:\Your\Correct\Path\tesseract.exe
```

### Issue 4: OCR Returns Poor Quality Text

This is usually an image preprocessing issue, not Tesseract.

**Your backend uses advanced preprocessing:**
- CLAHE contrast enhancement
- Bilateral filtering for noise removal
- Adaptive thresholding
- Morphological operations
- Auto-upscaling for small images

**The backend config is already optimized in:** `backend/services/ocr_service.py`

---

## Language Support

Tesseract supports 100+ languages. Default is English.

**To add more languages:**

1. **Download language data:**
```powershell
# Go to Tesseract installation directory
cd "C:\Program Files\Tesseract-OCR"

# Language files are in: tessdata folder
```

2. **Or download from:** https://github.com/UB-Mannheim/tessdata

3. **Place `.traineddata` files in:**
```
C:\Program Files\Tesseract-OCR\tessdata
```

**Example languages:**
- `eng.traineddata` - English (default)
- `hin.traineddata` - Hindi
- `spa.traineddata` - Spanish
- `fra.traineddata` - French
- `deu.traineddata` - German
- `chi_sim.traineddata` - Simplified Chinese
- `ara.traineddata` - Arabic

---

## Performance Configuration

### Current Configuration (In `backend/services/ocr_service.py`)

```python
# High-accuracy mode
custom_config = r'--oem 3 --psm 3 -c preserve_interword_spaces=1'
```

**What this means:**
- `--oem 3` = Use both legacy + LSTM models (highest accuracy)
- `--psm 3` = Automatic page segmentation (best for mixed layouts)
- `-c preserve_interword_spaces=1` = Keep spacing between words

### Alternative Configurations

**Faster but less accurate:**
```python
custom_config = r'--oem 1 --psm 6'
```

**Slower but more accurate:**
```python
custom_config = r'--oem 3 --psm 4 -c tessedit_pageseg_mode=4'
```

---

## Project Architecture

```
┌─────────────────────────────────────┐
│  User uploads image via Frontend    │
│  (http://localhost:5173)            │
└────────────────┬────────────────────┘
                 │ Image file (PNG/JPG/PDF)
                 ↓
┌─────────────────────────────────────┐
│  Backend (http://localhost:8000)    │
│  ┌──────────────────────────────┐   │
│  │ Image Preprocessing          │   │
│  │ • CLAHE enhancement          │   │
│  │ • Bilateral filtering        │   │
│  │ • Adaptive thresholding      │   │
│  └──────────────────┬───────────┘   │
│                     │ Processed img  │
│  ┌──────────────────↓───────────┐   │
│  │ Tesseract OCR                │   │
│  │ • Extract text               │   │
│  │ • Calculate confidence       │   │
│  └──────────────────┬───────────┘   │
└────────────────────┬────────────────┘
                     │ Extracted text + confidence
                     ↓
┌─────────────────────────────────────┐
│  Frontend displays results          │
│  • Show extracted text              │
│  • Confidence score                 │
│  • Allow editing                    │
│  • Export options                   │
└─────────────────────────────────────┘
```

---

## Testing with Sample Images

### Where to Get Test Images

1. **Your own documents** - Scan or photograph them
2. **PDF to Image** - Convert PDF pages to PNG/JPG
3. **Online samples** - Search "OCR test images"
4. **Screenshots** - Take screenshots of text

### Test Different Types

- ✅ Printed documents (books, newspapers)
- ✅ Handwritten notes (if quality is good)
- ✅ Screenshots
- ✅ Photos of text
- ✅ Colored backgrounds
- ✅ Low quality/faded text

---

## Command Reference

```powershell
# Check Tesseract version
tesseract --version

# List available languages
tesseract --list-langs

# OCR a single image
tesseract image.png output

# OCR with specific language
tesseract image.png output -l eng+spa

# OCR with configuration
tesseract image.png output --oem 3 --psm 6

# Get more help
tesseract --help-extra
```

---

## Environment Variables Summary

### Windows

**Option 1: System PATH (Recommended)**
```
C:\Program Files\Tesseract-OCR
```

**Option 2: Project .env**
```env
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
```

**Option 3: Python Code**
```python
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

---

## Links & Resources

- **Tesseract GitHub:** https://github.com/UB-Mannheim/tesseract/wiki
- **pytesseract Documentation:** https://github.com/madmaze/pytesseract
- **Tesseract Training:** https://github.com/tesseract-ocr/tesstrain
- **Language Data:** https://github.com/UB-Mannheim/tessdata

---

## Quick Setup Checklist

- [ ] Downloaded Tesseract installer
- [ ] Ran installer (or used Chocolatey)
- [ ] Verified installation: `tesseract --version`
- [ ] Added to System PATH (or set `.env` variable)
- [ ] Restarted PowerShell/Terminal
- [ ] Backend runs without tesseract errors
- [ ] Successfully uploaded and scanned an image
- [ ] Extracted text appears in result page

---

## Next Steps

1. ✅ Install Tesseract (this guide)
2. ✅ Run backend locally with Tesseract
3. ✅ Test OCR with sample images
4. ✅ Experiment with different image types
5. ✅ Deploy to Render (production)

---

**You're all set! Start scanning documents with high accuracy! 📄✨**
