import cv2
import pytesseract
import numpy as np
from core.config import settings

# Configure tesseract path
if settings.TESSERACT_PATH:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Advanced preprocessing for high-accuracy OCR extraction.
    Optimized for both documents and code/text with special characters.
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image")
    
    # Resize image if too small (upscale for better OCR)
    height, width = img.shape[:2]
    if width < 800:
        scale = 800 / width
        img = cv2.resize(img, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_CUBIC)
    
    # For very small text, apply more aggressive upscaling
    if width < 400:
        img = cv2.resize(img, (int(width * 3), int(height * 3)), interpolation=cv2.INTER_CUBIC)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    # Increased clipLimit for better contrast on text
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    
    # Denoise - bilateral filter preserves edges and text clarity
    denoised = cv2.bilateralFilter(enhanced, 11, 90, 90)
    
    # Apply Gaussian blur to reduce noise before thresholding
    blurred = cv2.GaussianBlur(denoised, (3, 3), 0)
    
    # Apply adaptive thresholding for better text extraction
    # Using larger blockSize for more context (helps with special characters)
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 17, 3
    )
    
    # Morphological operations to clean up - use smaller kernel to preserve details
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
    morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    # Light dilation to connect broken characters
    kernel_dilate = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 1))
    morph = cv2.dilate(morph, kernel_dilate, iterations=1)
    
    return morph

def perform_ocr(image_bytes: bytes) -> tuple[str, float]:
    """
    Performs high-accuracy OCR with improved preprocessing.
    Uses OEM 3 (Tesseract 4.0+) for best accuracy on both documents and code.
    Automatically selects best PSM based on image characteristics.
    """
    processed_img = preprocess_image(image_bytes)
    
    # PSM 3 (Fully automatic page segmentation) works better for mixed layouts and code
    # than PSM 6 (single uniform block)
    custom_config = r'--oem 3 --psm 3 -c preserve_interword_spaces=1 -c tessedit_pageseg_mode=3'
    
    text = pytesseract.image_to_string(processed_img, config=custom_config)
    
    # Get detailed confidence data
    data = pytesseract.image_to_data(processed_img, config=custom_config, output_type=pytesseract.Output.DICT)
    
    # Calculate average confidence of valid words
    confidences = [int(conf) for conf in data['conf'] if int(conf) != -1]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    
    # Clean up text - preserve structure while removing excessive whitespace
    lines = text.strip().split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Preserve leading spaces/indentation for code
        if line.strip():
            # Remove trailing whitespace but keep leading for indentation
            cleaned_lines.append(line.rstrip())
    
    cleaned_text = '\n'.join(cleaned_lines)
    
    # Remove multiple consecutive blank lines (keep single blank lines for formatting)
    while '\n\n\n' in cleaned_text:
        cleaned_text = cleaned_text.replace('\n\n\n', '\n\n')
    
    return cleaned_text, avg_confidence
