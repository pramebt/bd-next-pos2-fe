export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "token";

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return `${API_URL}/${imagePath.replace(/^\//, '')}`;
};
