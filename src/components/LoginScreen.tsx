import { useState } from 'react';
import './loginscreen.css';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Using simple hardcoded password protection as requested
    if (password === 'admin123') {
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h2>Admin Login</h2>
        <p>Please enter the admin password to access the IoT Tracker Dashboard.</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="password" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}
