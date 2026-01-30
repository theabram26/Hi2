import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [checklist, setChecklist] = useState({
    'do a': false,
    'do b': false,
    'do c': false
  });
  const [lastResetTime, setLastResetTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  
  // Build date (injected at build time)
  // @ts-ignore
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString();

  // Check authentication status
  const checkAuth = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch(`${apiUrl}/auth/status`, {
        credentials: 'include',
        cache: 'no-store' // Don't cache auth status
      });
      const data = await response.json();
      console.log('Auth status response:', data);
      if (data.authenticated) {
        console.log('User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('User not authenticated');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle login
  const handleLogin = () => {
    window.location.href = `${apiUrl}/auth/google`;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/logout`, {
        credentials: 'include'
      });
      if (response.ok) {
        setUser(null);
        setChecklist({
          'do a': false,
          'do b': false,
          'do c': false
        });
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Fetch checklist state from backend
  const fetchChecklist = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${apiUrl}/checklist`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setUser(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch checklist');
      }
      
      const data = await response.json();
      const { lastResetTime: resetTime, ...checklistData } = data;
      setChecklist(checklistData);
      setLastResetTime(resetTime);
      setError(null);
    } catch (err) {
      if (err.message !== 'Failed to fetch checklist') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update checklist item
  const updateChecklistItem = async (item, checked) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${apiUrl}/checklist`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ item, checked }),
      });
      
      if (response.status === 401) {
        setUser(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to update checklist');
      }
      
      const data = await response.json();
      const { lastResetTime: resetTime, ...checklistData } = data.state;
      setChecklist(checklistData);
      setLastResetTime(resetTime);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Check auth status on mount
    checkAuth();
    
    // Handle auth success redirect - wait a bit for session to be established
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Wait a moment for the session cookie to be set, then check auth
      setTimeout(() => {
        checkAuth();
      }, 500);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchChecklist();
      
      // Poll for updates every 2 seconds to catch resets
      const interval = setInterval(fetchChecklist, 2000);
      
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCheckboxChange = (item) => {
    const newChecked = !checklist[item];
    updateChecklistItem(item, newChecked);
  };

  const checklistItems = ['do a', 'do b', 'do c'];

  if (authLoading) {
    return (
      <div className="app">
        <div className="container">
          <p className="loading">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Checklist App</h1>
          {user ? (
            <div className="user-info">
              {user.photo && (
                <img src={user.photo} alt={user.displayName} className="user-photo" />
              )}
              <div className="user-details">
                <span className="user-name">{user.displayName}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={handleLogin} className="login-btn">
              Sign in with Google
            </button>
          )}
        </div>

        {!user ? (
          <div className="login-prompt">
            <p>Please sign in with Google to access the checklist.</p>
            <p className="build-date">
              Build date: {new Date(buildDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        ) : (
          <>
            {loading && <p className="loading">Loading checklist...</p>}
            {error && <p className="error">Error: {error}</p>}
            
            <div className="checklist">
              {checklistItems.map((item) => (
                <label key={item} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={checklist[item] || false}
                    onChange={() => handleCheckboxChange(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            
            <p className="info">Checklist resets every minute</p>
            {lastResetTime && (
              <p className="reset-time">
                Last reset: {new Date(lastResetTime).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
