/**
 * Garmin API Service
 * Handles all Garmin API communications
 */

import { GARMIN_CONFIG } from '../config/garmin.config'

export interface GarminUserLocation {
  latitude: number
  longitude: number
  altitude?: number
  timestamp: number
}

export interface GarminActivity {
  activityId: string
  activityName: string
  startTime: string
  endTime: string
  distance?: number
  duration?: number
  coordinates?: Array<{ latitude: number; longitude: number }>
}

export interface GarminUserInfo {
  userId: string
  displayName: string
  email: string
  profileImageUrl?: string
}

class GarminAPIService {
  private accessToken: string | null = null

  /**
   * Initialize OAuth flow
   */
  startOAuthFlow(): void {
    const authUrl = this.getAuthorizationUrl()
    window.location.href = authUrl
  }

  /**
   * Get authorization URL
   */
  private getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: GARMIN_CONFIG.CLIENT_ID,
      response_type: 'code',
      redirect_uri: GARMIN_CONFIG.REDIRECT_URI,
      scope: GARMIN_CONFIG.SCOPES.join(' '),
      state: this.generateRandomState(),
    })

    return `${GARMIN_CONFIG.AUTH_URL}?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      const response = await fetch(GARMIN_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: GARMIN_CONFIG.CLIENT_ID,
          client_secret: GARMIN_CONFIG.CLIENT_SECRET,
          redirect_uri: GARMIN_CONFIG.REDIRECT_URI,
        }).toString(),
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      if (this.accessToken) {
        localStorage.setItem('garmin_access_token', this.accessToken)
      }
      return true
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return false
    }
  }

  /**
   * Get current user information
   */
  async getUserInfo(): Promise<GarminUserInfo | null> {
    try {
      const response = await this.makeRequest('/userprofile/v2/userinfo')
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error fetching user info:', error)
      return null
    }
  }

  /**
   * Get user's latest location from recent activities
   */
  async getUserLocation(): Promise<GarminUserLocation | null> {
    try {
      // Fetch latest activity with GPS data
      const activities = await this.getRecentActivities(1)
      
      if (activities.length === 0) {
        console.warn('No recent activities found')
        return null
      }

      const activity = activities[0]
      if (!activity.coordinates || activity.coordinates.length === 0) {
        console.warn('No GPS coordinates in latest activity')
        return null
      }

      // Return the last coordinate (latest location)
      const lastCoord = activity.coordinates[activity.coordinates.length - 1]
      return {
        latitude: lastCoord.latitude,
        longitude: lastCoord.longitude,
        timestamp: new Date(activity.endTime).getTime(),
      }
    } catch (error) {
      console.error('Error fetching user location:', error)
      return null
    }
  }

  /**
   * Get recent activities with location data
   */
  async getRecentActivities(limit: number = 10): Promise<GarminActivity[]> {
    try {
      const response = await this.makeRequest(
        `/wellness-api/rest/activities?start=0&limit=${limit}`
      )

      if (response.ok) {
        const data = await response.json()
        return data.activities || []
      }
      return []
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  }

  /**
   * Get activity details including GPS coordinates
   */
  async getActivityDetails(activityId: string): Promise<GarminActivity | null> {
    try {
      const response = await this.makeRequest(`/activity/${activityId}`)

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error(`Error fetching activity ${activityId}:`, error)
      return null
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo() {
    try {
      const response = await this.makeRequest('/wellness-api/rest/devices')

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Error fetching device info:', error)
      return null
    }
  }

  /**
   * Make authenticated request to Garmin API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.accessToken || localStorage.getItem('garmin_access_token')

    if (!token) {
      throw new Error('No access token available. Please authenticate first.')
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    return fetch(`${GARMIN_CONFIG.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
  }

  /**
   * Logout and clear stored credentials
   */
  logout(): void {
    this.accessToken = null
    localStorage.removeItem('garmin_access_token')
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.accessToken || localStorage.getItem('garmin_access_token'))
  }

  /**
   * Generate random state for OAuth
   */
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

export const garminAPI = new GarminAPIService()
