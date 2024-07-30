export const stringToObject = (
  str: string | null
): { category: string; language: string } | null => {
  if (str && str.includes('category') && str.includes('language')) {
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
  }
  return null;
};

export const jsonToObject = (
  str: string | null
): { category: string; language: string } | null => {
  if (str && str.includes('category') && str.includes('language')) {
    // Remove all content before and after the curly braces.
    str = str.substring(8, str.length - 6);
    const obj = JSON.parse(str);
    return obj;
  }
  return null;
};
