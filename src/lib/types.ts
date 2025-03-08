/**
 * Interface describing the structure returned by PDF parsing
 */
export interface PDFData {
  text: string;
  numpages: number;
  numrender: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  version: string;
} 