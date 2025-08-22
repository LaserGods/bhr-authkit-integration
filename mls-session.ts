// import type { AuthTokenResponse } from "@/features/mls-resource/types";

interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
};

// Cache the auth token and last fetch time
let cachedToken: AuthTokenResponse | null = null;

let lastFetched = 0;

// Set token refresh interval to 25 minutes (want a 5-minute grace period)
const TokenRefreshInterval = 25 * 60 * 1000; // 25 minutes in milliseconds

// Function to refresh the token if needed
export const refreshTokenIfNeeded = async () => {
  const currentDate = Math.floor(Date.now() / 1000);

  // Check if token is missing or expired
  if (!cachedToken || currentDate - lastFetched > TokenRefreshInterval) {
    // eslint-disable-next-line no-console
    console.log("Fetching new token...");
    cachedToken = await fetchNewAccessToken();
    lastFetched = currentDate;
  }

  return cachedToken;
};

// Function to fetch a new access token from the authorization server
const fetchNewAccessToken = async () => {
  const url = "https://api.realtyfeed.com/v1/auth/token";
  const clientId = process.env.REALTYNA_CLIENT_ID!;
  const clientSecret = process.env.REALTYNA_CLIENT_SECRET!;

  // Prepare the request body with client credentials
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
  });

  // Configure the request
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
    },
    body,
  };

  // Send the request and handle the response
  const res = await fetch(url, config);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP error! status: ${res.status}, text: ${text}`);
  }
  const newTokens = (await res.json()) as AuthTokenResponse;
  return newTokens;
};
