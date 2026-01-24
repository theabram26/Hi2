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

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  // Fetch checklist state from backend
  const fetchChecklist = async () => {
    try {
      const response = await fetch(`${apiUrl}/checklist`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch checklist');
      }
      
      const data = await response.json();
      const { lastResetTime: resetTime, ...checklistData } = data;
      setChecklist(checklistData);
      setLastResetTime(resetTime);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update checklist item
  const updateChecklistItem = async (item, checked) => {
    try {
      const response = await fetch(`${apiUrl}/checklist`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item, checked }),
      });
      
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
    fetchChecklist();
    
    // Poll for updates every 2 seconds to catch resets
    const interval = setInterval(fetchChecklist, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCheckboxChange = (item) => {
    const newChecked = !checklist[item];
    updateChecklistItem(item, newChecked);
  };

  const checklistItems = ['do a', 'do b', 'do c'];

  return (
    <div className="app">
      <div className="container">
        <h1>Checklist App</h1>
        {loading && <p className="loading">Loading...</p>}
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
      </div>
    </div>
  );
}

export default App;
