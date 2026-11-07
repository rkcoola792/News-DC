from pathlib import Path
from xml.sax.saxutils import escape
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

root = Path(__file__).resolve().parents[1]
out = root / 'output' / 'pdf'
out.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='GuideTitle', fontName='Helvetica-Bold', fontSize=24, leading=29, spaceAfter=18, textColor=colors.black))
styles.add(ParagraphStyle(name='GuideH1', fontName='Helvetica-Bold', fontSize=16, leading=20, spaceBefore=20, spaceAfter=10, keepWithNext=True, textColor=colors.black))
styles.add(ParagraphStyle(name='GuideH2', fontName='Helvetica-Bold', fontSize=12, leading=16, spaceBefore=13, spaceAfter=7, keepWithNext=True, textColor=colors.black))
styles.add(ParagraphStyle(name='GuideBody', fontName='Helvetica', fontSize=10.2, leading=15, spaceAfter=9, textColor=colors.HexColor('#20252b')))
styles.add(ParagraphStyle(name='GuideBullet', parent=styles['GuideBody'], leftIndent=12, firstLineIndent=-7, spaceAfter=6))
styles.add(ParagraphStyle(name='GuideQuestion', fontName='Helvetica-Bold', fontSize=11.2, leading=16, spaceBefore=13, spaceAfter=5, keepWithNext=True, textColor=colors.black))
styles.add(ParagraphStyle(name='GuideAnswer', parent=styles['GuideBody'], spaceAfter=13))

def footer(canvas, doc):
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#5b6470'))
    canvas.drawString(46, 28, 'NewsDC application study guide | 7 November 2026')
    canvas.drawRightString(A4[0]-46, 28, str(doc.page))

story=[]
for line in (root/'docs'/'CLIENT_PRESENTATION_GUIDE.md').read_text(encoding='utf-8').splitlines():
    if not line.strip(): continue
    if line.startswith('**Question '): style='GuideQuestion'; line=line.strip('*')
    elif line.startswith('**Answer:** '):
        story.append(Paragraph('<b>Answer:</b> '+escape(line[len('**Answer:** '):]), styles['GuideAnswer']))
        continue
    elif line.startswith('# '): style='GuideTitle'; line=line[2:]
    elif line.startswith('## '): style='GuideH1'; line=line[3:]
    elif line.startswith('### '): style='GuideH2'; line=line[4:]
    elif line.startswith('- '): style='GuideBullet'; line='- '+line[2:]
    else: style='GuideBody'
    story.append(Paragraph(escape(line), styles[style]))
doc=SimpleDocTemplate(str(out/'NewsDC_Client_Presentation_Guide.pdf'), pagesize=A4,
    rightMargin=46,leftMargin=46,topMargin=43,bottomMargin=46,
    title='NewsDC application study and client presentation guide',author='NewsDC')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(out/'NewsDC_Client_Presentation_Guide.pdf')
