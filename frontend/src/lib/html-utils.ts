/**
 * Utility functions for handling HTML content encoding and decoding
 */

/**
 * Decodes HTML entities to actual HTML
 * Useful when loading HTML content from database to display in rich text editors
 * @param text - Text with HTML entities (e.g., "&lt;h2&gt;Hello&lt;/h2&gt;")
 * @returns Decoded HTML (e.g., "<h2>Hello</h2>")
 */
export const decodeHTMLEntities = (text: string): string => {
  if (typeof window === 'undefined') return text;
  if (!text) return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

/**
 * Encodes HTML to HTML entities
 * Useful when you need to display HTML as plain text
 * @param html - HTML string (e.g., "<h2>Hello</h2>")
 * @returns Encoded HTML entities (e.g., "&lt;h2&gt;Hello&lt;/h2&gt;")
 */
export const encodeHTMLEntities = (html: string): string => {
  if (typeof window === 'undefined') return html;
  if (!html) return '';

  const textarea = document.createElement('textarea');
  textarea.textContent = html;
  return textarea.innerHTML;
};

/**
 * Strips all HTML tags from a string, leaving only plain text
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export const stripHTMLTags = (html: string): string => {
  if (typeof window === 'undefined') return html;
  if (!html) return '';

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Sanitizes HTML content by removing potentially dangerous elements
 * Note: For production use, consider using a library like DOMPurify
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') return html;
  if (!html) return '';

  // Basic sanitization - remove script tags and event handlers
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove script tags
  const scripts = div.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].parentNode?.removeChild(scripts[i]);
  }

  // Remove event handlers
  const allElements = div.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const attributes = allElements[i].attributes;
    for (let j = attributes.length - 1; j >= 0; j--) {
      const attrName = attributes[j].name;
      if (attrName.startsWith('on')) {
        allElements[i].removeAttribute(attrName);
      }
    }
  }

  return div.innerHTML;
};
