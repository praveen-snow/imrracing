import { useState, useRef, useEffect } from 'react'
import './App.css'

interface IFrameWindow {
  id: number
  title: string
  url: string
}

function App() {
  const [windows] = useState<IFrameWindow[]>([
    { id: 1, title: 'Baja Score', url: 'https://trackleaders.com/baja1k25i.php?name=Gurpinder_Singh_Sarao' },
    { id: 2, title: '305x', url: 'https://trackleaders.com/baja1k25i.php?name=Gurpinder_Singh_Sarao' },
    { id: 3, title: 'DK', url: 'https://share.garmin.com/share/summitandthrottle' },
    { id: 4, title: 'Ashish', url: 'https://share.garmin.com/Z45AN' },
    { id: 5, title: 'Rajiv', url: 'https://share.garmin.com/NXN7O' },
  ])

  const [expandedWindowId, setExpandedWindowId] = useState<number | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([])
  const expandedIframeRef = useRef<HTMLIFrameElement | null>(null)
  const autoRefreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const iframeRefreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleRefreshAll = () => {
    iframeRefs.current.forEach((iframe) => {
      if (iframe) {
        const src = iframe.src
        iframe.src = src
      }
    })
  }

  // Click refresh button inside iframe (id 2 - 305x) every 1 minute
  const clickIframeRefreshButton = () => {
    const iframe = iframeRefs.current[1] // Index 1 = id 2
    console.log('🔍 Attempting to click refreshMapButton...')
    if (iframe) {
      console.log('✅ iframe found:', iframe.src)
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
        if (iframeDoc) {
          console.log('✅ iframe document accessible')
          const refreshButton = iframeDoc.getElementById('refreshMapButton')
          if (refreshButton) {
            console.log('✅ refreshMapButton found! Clicking now...')
            refreshButton.click()
            console.log('✅ refreshMapButton clicked successfully!')
          } else {
            console.warn('❌ refreshMapButton NOT found in iframe')
            console.log('Available elements:', iframeDoc.body.innerHTML.substring(0, 500))
          }
        } else {
          console.warn('❌ Cannot access iframe document (cross-origin?)')
        }
      } catch (error) {
        console.error('❌ Error clicking iframe button:', error)
      }
    } else {
      console.warn('❌ iframe not found at index 1')
    }
  }

  // Setup auto-refresh interval
  useEffect(() => {
    if (autoRefreshEnabled) {
      // Initial refresh
      handleRefreshAll()
      
      // Set interval for 5 minutes (300000ms)
      autoRefreshIntervalRef.current = setInterval(() => {
        handleRefreshAll()
      }, 300000)
    } else {
      // Clear interval when disabled
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
        autoRefreshIntervalRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }
    }
  }, [autoRefreshEnabled])

  // Setup iframe refresh button click every 1 minute
  useEffect(() => {
    // Click immediately on mount
    clickIframeRefreshButton()
    
    // Set interval to click every 1 minute (60000ms)
    iframeRefreshIntervalRef.current = setInterval(() => {
      clickIframeRefreshButton()
    }, 60000)

    // Cleanup on unmount
    return () => {
      if (iframeRefreshIntervalRef.current) {
        clearInterval(iframeRefreshIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="app-container">
      {/* Dashboard view */}
      <div className={`dashboard-view ${expandedWindowId ? 'hidden' : ''}`}>
        <header className="app-header">
          <div className="header-left">
            <img src={`${import.meta.env.BASE_URL}imr-logo.png`} alt="IMR Racing" className="imr-logo" />
            <h1>IMR BAJA 360</h1>
          </div>
          <div className="header-controls">
            <div className="toggle-wrapper">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {autoRefreshEnabled ? '🔄 Auto Refresh ON' : 'Auto Refresh OFF'}
                </span>
              </label>
            </div>
            <button className="refresh-btn" onClick={handleRefreshAll}>
              🔄 Refresh All Windows
            </button>
          </div>
        </header>

        <div className="grid-container">
          {windows.map((window, idx) => (
            <div key={window.id} className="iframe-wrapper">
              <div className="iframe-header">
                <h3>{window.title}</h3>
                <button 
                  className="expand-btn" 
                  onClick={() => setExpandedWindowId(window.id)}
                  title="Expand to fullscreen"
                >
                  ⛶
                </button>
              </div>
              {window.url ? (
                <iframe
                  ref={(el) => { if (el) iframeRefs.current[idx] = el }}
                  src={window.url}
                  title={window.title}
                  className="iframe"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div className="iframe-placeholder">
                  <p>No URL provided</p>
                  <small>Enter a URL above to display content</small>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expanded view modal */}
      {expandedWindowId && (
        <div className="expanded-view">
          <div className="expanded-header">
            <h1>{windows.find(w => w.id === expandedWindowId)?.title}</h1>
            <button className="close-btn" onClick={() => setExpandedWindowId(null)}>
              ✕ Close
            </button>
          </div>
          <iframe
            ref={expandedIframeRef}
            src={windows.find(w => w.id === expandedWindowId)?.url}
            title={windows.find(w => w.id === expandedWindowId)?.title}
            className="expanded-iframe"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}
    </div>
  )
}

export default App
