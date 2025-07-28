// utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeMessage = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: []
  });
};