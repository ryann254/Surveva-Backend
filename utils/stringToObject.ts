import httpStatus from 'http-status';
import { ApiError } from '../errors';
import { logger } from '../config';

export const stringToObject = (
  str: string | null
): { category: string; language: string } | null => {
  if (str && str.includes('category') && str.includes('language')) {
    try {
      // Remove curly braces
      str = str.substring(1, str.length - 1);
      // Split string into key-value pairs
      let pairs = str.split(', ');

      let obj = {
        category: '',
        language: '',
      };
      pairs.forEach((pair) => {
        // Split each pair into key and value
        let [key, value] = pair.split(': ');
        // Trim spaces and assign to object
        obj[key.trim()] = value.trim();
      });

      return obj;
    } catch (error) {
      logger.error(error);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Failed to get Category and Language from Open AI'
      );
    }
  }
  return null;
};

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
