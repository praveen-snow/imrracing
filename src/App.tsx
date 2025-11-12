import { useState, useRef, useEffect } from 'react'
import './App.css'

interface IFrameWindow {
  id: number
  title: string
  url: string
}

function App() {
  const [windows] = useState<IFrameWindow[]>([
    { id: 1, title: 'Baja Score', url: 'https://score-raceinfo.com/58th-baja-1000-nov-10-16-2025/' },
    { id: 2, title: 'DK', url: 'https://share.garmin.com/share/summitandthrottle' },
    { id: 3, title: 'Ashish', url: 'https://share.garmin.com/Z45AN' },
    { id: 4, title: 'Rajiv', url: 'https://share.garmin.com/NXN7O' },
  ])

  const [expandedWindowId, setExpandedWindowId] = useState<number | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([])
  const expandedIframeRef = useRef<HTMLIFrameElement | null>(null)
  const autoRefreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleRefreshAll = () => {
    iframeRefs.current.forEach((iframe) => {
      if (iframe) {
        const src = iframe.src
        iframe.src = src
      }
    })
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

  return (
    <div className="app-container">
      {/* Dashboard view */}
      <div className={`dashboard-view ${expandedWindowId ? 'hidden' : ''}`}>
        <header className="app-header">
          <div className="header-left">
            <img src="/imr-logo.png" alt="IMR Racing" className="imr-logo" />
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
