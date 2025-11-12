/**
 * Garmin API Configuration
 * Store your Garmin Developer credentials here
 */

const getEnvVar = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue
}

export const GARMIN_CONFIG = {
  // Get these from https://developer.garmin.com/
  CLIENT_ID: getEnvVar('VITE_GARMIN_CLIENT_ID', 'YOUR_CLIENT_ID_HERE'),
  CLIENT_SECRET: getEnvVar('VITE_GARMIN_CLIENT_SECRET', 'YOUR_CLIENT_SECRET_HERE'),
  
  // OAuth endpoints
  AUTH_URL: 'https://auth.garmin.com/oauth-login',
  TOKEN_URL: 'https://auth.garmin.com/oauth-token',
  
  // API endpoints
  API_BASE_URL: 'https://apis.garmin.com',
  WELLNESS_API: 'https://apis.garmin.com/wellness-api/rest',
  
  // Redirect URI - must match what you registered on Garmin Developer portal
  REDIRECT_URI: `${window.location.origin}/callback`,
  
  // Scopes requested from user
  SCOPES: [
    'ACTIVITY:READ',
    'ACTIVITY:CREATE',
    'ACTIVITY:UPDATE',
    'ACTIVITY:DELETE',
    'DEVICE_INFO:READ',
    'USER_INFO:READ',
    'WELLNESS:READ',
  ],
}

export const getAuthorizationUrl = (): string => {
  const params = new URLSearchParams({
    client_id: GARMIN_CONFIG.CLIENT_ID,
    response_type: 'code',
    redirect_uri: GARMIN_CONFIG.REDIRECT_URI,
    scope: GARMIN_CONFIG.SCOPES.join(' '),
    state: generateRandomState(),
  })

  return `${GARMIN_CONFIG.AUTH_URL}?${params.toString()}`
}

const generateRandomState = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
