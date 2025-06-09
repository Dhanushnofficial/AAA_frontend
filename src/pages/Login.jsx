import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/login', { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/register', { username, password });
      alert('Registration successful! You can now log in.');
      setIsRegistering(false); // switch to login
      setUsername('');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        <p onClick={() => setIsRegistering(!isRegistering)} className="toggle-link">
          {isRegistering ? 'Already have an account? Login' : 'Don’t have an account? Register'}
        </p>
      </form>

      {/* Optional simple styles */}
      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f5f5;
        }

        .auth-form {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          width: 300px;
        }

        .auth-form input {
          margin-bottom: 1rem;
          padding: 0.5rem;
          font-size: 1rem;
        }

        .auth-form button {
          padding: 0.6rem;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }

        .toggle-link {
          margin-top: 1rem;
          color: #007bff;
          cursor: pointer;
          text-align: center;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default Login;
