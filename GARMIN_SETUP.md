# Garmin API Integration Guide

This project includes a complete Garmin API integration to fetch user location and activity data.

## Features

✅ OAuth 2.0 Authentication with Garmin  
✅ Fetch user information  
✅ Get real-time location from latest activities  
✅ Access activity history with GPS coordinates  
✅ Device information retrieval  

## Setup Instructions

### 1. Register with Garmin Developer Portal

1. Go to https://developer.garmin.com/
2. Sign in or create an account
3. Create a new OAuth application
4. You'll receive:
   - **Client ID**
   - **Client Secret**

### 2. Configure Redirect URI

In your Garmin Developer Portal:
- Set Redirect URI to: `http://localhost:5173/callback` (for local development)
- For production: `https://yourdomain.com/callback`

### 3. Setup Environment Variables

1. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

2. Add your Garmin credentials:

```
REACT_APP_GARMIN_CLIENT_ID=your_actual_client_id
REACT_APP_GARMIN_CLIENT_SECRET=your_actual_client_secret
```

### 4. Update Redirect URI in Code (if needed)

If your redirect URI is different, update `src/config/garmin.config.ts`:

```typescript
REDIRECT_URI: `${window.location.origin}/callback`
```

## Usage

### Import and Use in Components

```tsx
import { GarminAuth } from './components/GarminAuth'

function App() {
  return (
    <GarminAuth 
      onLocationUpdate={(location) => {
        console.log('User location:', location)
        console.log('Latitude:', location.latitude)
        console.log('Longitude:', location.longitude)
      }}
    />
  )
}
```

### Using the Garmin API Service Directly

```tsx
import { garminAPI } from './services/garminAPI'

// Start OAuth flow
garminAPI.startOAuthFlow()

// Get user info
const userInfo = await garminAPI.getUserInfo()

// Get current location
const location = await garminAPI.getUserLocation()
console.log(`Lat: ${location.latitude}, Long: ${location.longitude}`)

// Get recent activities
const activities = await garminAPI.getRecentActivities(10)

// Get specific activity details
const activity = await garminAPI.getActivityDetails(activityId)

// Check authentication status
if (garminAPI.isAuthenticated()) {
  console.log('User is authenticated')
}

// Logout
garminAPI.logout()
```

## API Reference

### GarminAPIService Methods

#### `startOAuthFlow(): void`
Initiates the OAuth authentication flow with Garmin.

#### `getUserInfo(): Promise<GarminUserInfo | null>`
Fetches authenticated user's profile information.

```typescript
interface GarminUserInfo {
  userId: string
  displayName: string
  email: string
  profileImageUrl?: string
}
```

#### `getUserLocation(): Promise<GarminUserLocation | null>`
Gets the user's latest location from their most recent activity with GPS data.

```typescript
interface GarminUserLocation {
  latitude: number
  longitude: number
  altitude?: number
  timestamp: number
}
```

#### `getRecentActivities(limit?: number): Promise<GarminActivity[]>`
Retrieves recent activities (default limit: 10).

```typescript
interface GarminActivity {
  activityId: string
  activityName: string
  startTime: string
  endTime: string
  distance?: number
  duration?: number
  coordinates?: Array<{ latitude: number; longitude: number }>
}
```

#### `getActivityDetails(activityId: string): Promise<GarminActivity | null>`
Gets detailed information for a specific activity including GPS coordinates.

#### `getDeviceInfo(): Promise<any>`
Retrieves information about connected Garmin devices.

#### `isAuthenticated(): boolean`
Checks if user is currently authenticated.

#### `logout(): void`
Clears authentication tokens and logs out the user.

## Troubleshooting

### "No access token available"
- User needs to authenticate first using `startOAuthFlow()`
- Check that `.env.local` has correct credentials

### "No recent activities found"
- User might not have any activities in their Garmin account
- Or recent activities don't have GPS data enabled

### CORS Errors
- Garmin APIs are protected by CORS
- You may need to use a backend proxy in production
- For development, Garmin handles CORS appropriately

### OAuth Redirect Issues
- Ensure redirect URI matches exactly what's registered in Garmin Developer Portal
- Check that `REDIRECT_URI` in config matches your application URL

## Security Best Practices

🔒 **Never commit `.env.local` to version control**  
🔒 **Keep `CLIENT_SECRET` private - use backend proxies in production**  
🔒 **Store tokens securely (consider using HttpOnly cookies)**  
🔒 **Validate tokens server-side before API calls**  

## Integration with Your Dashboard

The Garmin integration can be used to populate your iframe windows with:
- Real-time location data
- Activity information
- Device status
- Performance metrics

Example - Update Window 1 with location:

```tsx
const [windows, setWindows] = useState([...])

const handleLocationUpdate = (location: GarminUserLocation) => {
  const mapUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`
  setWindows(prev => {
    prev[0].url = mapUrl
    return [...prev]
  })
}

return <GarminAuth onLocationUpdate={handleLocationUpdate} />
```

## Resources

- [Garmin Developer Portal](https://developer.garmin.com/)
- [Garmin Health API Documentation](https://developer.garmin.com/health-api/overview)
- [OAuth 2.0 Reference](https://datatracker.ietf.org/doc/html/rfc6749)

---

For more information or issues, check the official Garmin documentation.
