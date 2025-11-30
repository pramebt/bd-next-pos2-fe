// API Configuration
export const config = {
  apiServer: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  token: "token",
};

// Helper function to get API endpoint
export const getApiUrl = (endpoint: string) => {
  return `${config.apiServer}${endpoint}`;
};
