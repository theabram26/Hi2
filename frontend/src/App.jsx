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

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
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
    
    // Handle auth success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      checkAuth();
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
