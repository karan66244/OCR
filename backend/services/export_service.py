from io import BytesIO
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY


def export_to_docx(text: str, filename: str) -> BytesIO:
    """
    Export extracted text to DOCX format with formatting.
    """
    doc = Document()
    
    # Add title
    title = doc.add_heading('Extracted Text', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add metadata
    metadata = doc.add_paragraph()
    metadata.add_run(f"Filename: {filename}\n").italic = True
    metadata_format = metadata.paragraph_format
    metadata_format.space_before = Pt(6)
    metadata_format.space_after = Pt(12)
    
    # Add separator
    doc.add_paragraph('_' * 80)
    
    # Parse text and add paragraphs with proper formatting
    paragraphs = text.split('\n\n')
    for para_text in paragraphs:
        if para_text.strip():
            para = doc.add_paragraph(para_text.strip())
            para_format = para.paragraph_format
            para_format.line_spacing = 1.5
            para_format.space_after = Pt(12)
            para_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    # Save to BytesIO
    output = BytesIO()
    doc.save(output)
    output.seek(0)
    return output


def export_to_pdf(text: str, filename: str) -> BytesIO:
    """
    Export extracted text to PDF format.
    """
    output = BytesIO()
    doc = SimpleDocTemplate(
        output,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    
    # Create story (content)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=RGBColor(0, 51, 102),
        spaceAfter=30,
        alignment=TA_LEFT,
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=16,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
    )
    
    # Add title
    story.append(Paragraph("Extracted Text", title_style))
    story.append(Spacer(1, 12))
    
    # Add metadata
    metadata_text = f"<i>Filename: {filename}</i>"
    story.append(Paragraph(metadata_text, styles['Italic']))
    story.append(Spacer(1, 12))
    
    # Add separator
    story.append(Paragraph("_" * 80, styles['Normal']))
    story.append(Spacer(1, 12))
    
    # Parse and add text
    paragraphs = text.split('\n\n')
    for idx, para_text in enumerate(paragraphs):
        if para_text.strip():
            # Replace newlines within paragraph
            formatted_text = para_text.strip().replace('\n', '<br/>')
            story.append(Paragraph(formatted_text, body_style))
            
            # Add page break after every 5 paragraphs to maintain readability
            if (idx + 1) % 5 == 0:
                story.append(PageBreak())
    
    # Build PDF
    doc.build(story)
    output.seek(0)
    return output


def export_to_txt(text: str) -> BytesIO:
    """
    Export extracted text to TXT format.
    """
    output = BytesIO()
    output.write(text.encode('utf-8'))
    output.seek(0)
    return output
