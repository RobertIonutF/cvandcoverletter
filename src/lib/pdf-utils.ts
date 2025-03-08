// PDF parser compatible with Next.js server actions
import '@ungap/with-resolvers'
import { getDocument, type PDFDocumentProxy } from 'pdfjs-dist'
import type { PDFData } from './types'

// No direct import for pdf-parse to avoid import issues

/**
 * Parse a PDF file from a Buffer
 * @param buffer - PDF file as Buffer
 * @returns Parsed PDF data with text content
 */
export async function parsePDF(buffer: Buffer): Promise<PDFData> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty buffer provided')
    }
    
    try {
      // First try with PDF.js library
      return await parsePDFWithPDFJS(buffer);
    } catch (pdfJsError) {
      console.warn('PDF.js parsing failed, trying fallback method:', pdfJsError);
      // If PDF.js fails, try with pdf-parse as fallback
      return await parsePDFWithPdfParse(buffer);
    }
  } catch (error) {
    console.error('Error parsing PDF (all methods failed):', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    } else {
      throw new Error('Failed to parse PDF: Unknown error');
    }
  }
}

/**
 * Parse PDF using PDF.js library
 */
async function parsePDFWithPDFJS(buffer: Buffer): Promise<PDFData> {
  // Load PDF.js worker dynamically (important for Next.js server components)
  // @ts-expect-error - Dynamic import works at runtime
  await import('pdfjs-dist/build/pdf.worker.mjs')
  
  // Convert Buffer to Uint8Array as required by PDF.js
  const uint8Array = new Uint8Array(buffer);
  
  console.log(`Processing PDF buffer with PDF.js: ${buffer.length} bytes, converted to Uint8Array of ${uint8Array.length} bytes`)
  
  // Load the PDF document
  const pdf = await getDocument({
    data: uint8Array,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true
  }).promise
  
  // Extract metadata
  const metadata = await pdf.getMetadata()
  
  // Initialize result object
  const result: PDFData = {
    text: '',
    numpages: pdf.numPages,
    numrender: 0,
    info: metadata.info ? (metadata.info as unknown as Record<string, unknown>) : {},
    metadata: metadata.metadata ? (metadata.metadata as unknown as Record<string, unknown>) : {},
    version: pdf.fingerprints[0] || 'unknown'
  }
  
  console.log(`PDF loaded successfully with PDF.js: ${pdf.numPages} pages`)
  
  // Extract text from all pages
  result.text = await extractTextFromPDF(pdf)
  result.numrender = pdf.numPages
  
  return result
}

/**
 * Parse PDF using pdf-parse library as fallback
 */
async function parsePDFWithPdfParse(buffer: Buffer): Promise<PDFData> {
  console.log('Attempting to parse PDF with pdf-parse fallback library');
  
  // Dynamically import pdf-parse
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = pdfParseModule.default;
  
  // Use pdf-parse library
  const result = await pdfParse(buffer);
  
  console.log(`PDF parsed successfully with pdf-parse: ${result.numpages} pages, ${result.text.length} chars of text`);
  
  return {
    text: result.text,
    numpages: result.numpages,
    numrender: result.numpages,
    info: result.info || {},
    metadata: result.metadata || {},
    version: result.version || 'unknown'
  };
}

/**
 * Extract text from all pages of a PDF document
 * @param pdf - PDF document
 * @returns Extracted text content
 */
async function extractTextFromPDF(pdf: PDFDocumentProxy): Promise<string> {
  let fullText = ''
  
  // Process each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    
    // Extract and concatenate text items
    const pageText = textContent.items
      .filter(item => 'str' in item)
      .map(item => ('str' in item) ? item.str : '')
      .join(' ')
    
    fullText += pageText + '\n\n'
  }
  
  return fullText
} 