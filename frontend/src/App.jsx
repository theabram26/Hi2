import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/hello`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch message');
        }
        
        const data = await response.json();
        setMessage(data.message);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h1>Hello World App</h1>
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default App;
