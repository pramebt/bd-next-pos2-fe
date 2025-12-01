// Helper function to get API endpoint
export const getApiUrl = (endpoint: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${apiUrl}${endpoint}`;
};

// Helper function to get token key
export const getTokenKey = () => {
  return process.env.NEXT_PUBLIC_TOKEN_KEY || "token";
};
