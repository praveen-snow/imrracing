import { useState, useEffect } from 'react'
import type { GarminUserLocation, GarminUserInfo } from '../services/garminAPI'
import { garminAPI } from '../services/garminAPI'

interface GarminAuthProps {
  onLocationUpdate?: (location: GarminUserLocation) => void
}

export function GarminAuth({ onLocationUpdate }: GarminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInfo, setUserInfo] = useState<GarminUserInfo | null>(null)
  const [location, setLocation] = useState<GarminUserLocation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      handleOAuthCallback(code)
    }

    // Check if already authenticated
    const isAuth = garminAPI.isAuthenticated()
    setIsAuthenticated(isAuth)
  }, [])

  const handleOAuthCallback = async (code: string) => {
    setLoading(true)
    setError(null)

    const success = await garminAPI.exchangeCodeForToken(code)
    if (success) {
      setIsAuthenticated(true)
      // Clear the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      setError('Failed to authenticate with Garmin')
    }
    setLoading(false)
  }

  const handleLogin = () => {
    setLoading(true)
    garminAPI.startOAuthFlow()
  }

  const handleGetUserInfo = async () => {
    setLoading(true)
    setError(null)

    const info = await garminAPI.getUserInfo()
    if (info) {
      setUserInfo(info)
    } else {
      setError('Failed to fetch user info')
    }
    setLoading(false)
  }

  const handleGetLocation = async () => {
    setLoading(true)
    setError(null)

    const loc = await garminAPI.getUserLocation()
    if (loc) {
      setLocation(loc)
      onLocationUpdate?.(loc)
    } else {
      setError('Failed to fetch location. Make sure you have recent activities with GPS data.')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    garminAPI.logout()
    setIsAuthenticated(false)
    setUserInfo(null)
    setLocation(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="garmin-auth">
        <div className="garmin-auth-card">
          <h2>Connect with Garmin</h2>
          <p>Link your Garmin account to access location data</p>
          <button onClick={handleLogin} disabled={loading} className="garmin-login-btn">
            {loading ? 'Connecting...' : 'Login with Garmin'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="garmin-auth authenticated">
      <div className="garmin-auth-card">
        <h2>Garmin Connected ✓</h2>

        <div className="garmin-section">
          <button onClick={handleGetUserInfo} disabled={loading}>
            {loading ? 'Loading...' : 'Get User Info'}
          </button>
          {userInfo && (
            <div className="info-box">
              <p><strong>User:</strong> {userInfo.displayName}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
            </div>
          )}
        </div>

        <div className="garmin-section">
          <button onClick={handleGetLocation} disabled={loading} className="location-btn">
            {loading ? 'Loading...' : '📍 Get Current Location'}
          </button>
          {location && (
            <div className="info-box">
              <p><strong>Latitude:</strong> {location.latitude.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {location.longitude.toFixed(6)}</p>
              <p><strong>Time:</strong> {new Date(location.timestamp).toLocaleString()}</p>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  )
}
