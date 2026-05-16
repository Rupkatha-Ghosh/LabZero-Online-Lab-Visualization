/**
 * Utility to determine the best signaling URL based on the current environment.
 * Handles production env vars, local development, and mobile-to-laptop connectivity.
 */
export const getDefaultSignalingUrl = () => {
  // 1. Check for environment variable (Production)
  if (import.meta.env.VITE_SIGNALING_URL) {
    return import.meta.env.VITE_SIGNALING_URL;
  }

  // 2. Local Development fallback
  // We use the same host as the website (including port) and the /signal proxy
  const host = window.location.host || "localhost:3000";
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  
  return `${protocol}://${host}/signal`;
};
