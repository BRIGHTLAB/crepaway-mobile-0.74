export const parseQueryParams = (query: string) => {
  const params: Record<string, string | string[]> = {};
  query.split('&').forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) {
      const decodedValue = decodeURIComponent(value);
      if (params[key]) {
        params[key] = Array.isArray(params[key])
          ? [...params[key], decodedValue]
          : [params[key], decodedValue];
      } else {
        params[key] = decodedValue;
      }
    }
  });
  return params;
};
