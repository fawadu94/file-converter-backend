import sys
from pdf2docx import Converter

def convert(pdf_path, docx_path):
    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 convert_pdf.py input.pdf output.docx", file=sys.stderr)
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])