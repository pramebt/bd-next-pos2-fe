export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "token";

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const normalizedPath = imagePath.replace(/^\//, '');
  const withUploadsPrefix = normalizedPath.startsWith('uploads/')
    ? normalizedPath
    : `uploads/${normalizedPath}`;
  return `${API_URL}/${withUploadsPrefix}`;
};
