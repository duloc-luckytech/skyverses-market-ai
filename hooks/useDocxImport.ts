import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import * as mammoth from 'mammoth';

export interface DocxOutline {
  title: string;
  body: string;
}

export const useDocxImport = () => {
  const { showToast } = useToast();

  const parseDocx = useCallback(async (file: File): Promise<DocxOutline[]> => {
    if (!file || file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      throw new Error('Invalid file type. Please select a .docx file.');
    }

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Convert DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      // Parse HTML to extract headings and paragraphs
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract content structure
      const outline: DocxOutline[] = [];
      let currentTitle = '';
      let currentBody: string[] = [];

      // Get all block-level elements
      const elements = doc.body.children;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const tagName = el.tagName.toLowerCase();
        const text = el.textContent?.trim() || '';

        // Detect headings (h1-h6)
        if (tagName.match(/^h[1-6]$/)) {
          // Save previous slide if it has content
          if (currentTitle) {
            outline.push({
              title: currentTitle,
              body: currentBody.join('\n').trim() || '(No content)',
            });
          }

          // Start new slide
          currentTitle = text;
          currentBody = [];
        }
        // Detect paragraphs
        else if (tagName === 'p' && text) {
          currentBody.push(`• ${text}`);
        }
        // Detect list items
        else if (tagName === 'li' && text) {
          currentBody.push(`• ${text}`);
        }
      }

      // Save last slide
      if (currentTitle) {
        outline.push({
          title: currentTitle,
          body: currentBody.join('\n').trim() || '(No content)',
        });
      }

      if (outline.length === 0) {
        throw new Error('No content found in DOCX file. Please ensure it has headings.');
      }

      return outline;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error parsing DOCX';
      throw new Error(message);
    }
  }, []);

  return { parseDocx };
};
