import { logger } from '../config';

export const jsonToObject = (
  str: string | null
): { category: string; language: string } | null => {
  if (str && str.includes('category') && str.includes('language')) {
    try {
      // Remove all content before and after the curly braces.
      str = str.substring(8, str.length - 6);
      const obj = JSON.parse(str);
      return obj;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
  return null;
};
