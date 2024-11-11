import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Loader2 } from 'lucide-react';

const AuthModal = ({ setShowModal, isSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['AuthToken', 'UserId']);

  const navigate = useNavigate();

  const handleClick = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp && password !== confirmPassword) {
        setError('Passwords need to match!');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`http://localhost:8000/${isSignUp ? 'signup' : 'login'}`, { email, password });

      setCookie('AuthToken', response.data.token);
      setCookie('UserId', response.data.userId);

      const success = response.status === 201;
      if (success && isSignUp) navigate('/onboarding');
      if (success && !isSignUp) navigate('/dashboard');

      window.location.reload();
    } catch (error) {
      console.log(error);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  };

  const modalContent = {
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '24rem',
    overflow: 'hidden',
  };

  const modalHeader = {
    position: 'relative',
    background: 'linear-gradient(to right, #ff5864, #ff655b)',
    padding: '1.5rem',
  };

  const closeButton = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
  };

  const modalTitle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    margin: 0,
  };

  const modalBody = {
    padding: '1.5rem',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  };

  const submitButton = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'linear-gradient(to right, #ff5864, #ff655b)',
    color: 'white',
    fontWeight: '600',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const errorMessage = {
    marginTop: '1rem',
    color: '#e53e3e',
    textAlign: 'center',
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <div style={modalHeader}>
          <button 
            onClick={handleClick} 
            style={closeButton}
            onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            ✕
          </button>
          <h2 style={modalTitle}>{isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}</h2>
        </div>
        <div style={modalBody}>
          <p style={{ fontSize: '0.875rem', color: '#4a5568', marginBottom: '1.5rem' }}>
          Enter your details

          </p>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            {isSignUp && (
              <input
                type="password"
                id="password-check"
                name="password-check"
                placeholder="Confirm password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
            )}
            <button 
              type="submit" 
              style={{
                ...submitButton,
                opacity: isLoading ? 0.7 : 1,
                transform: isLoading ? 'scale(0.98)' : 'scale(1)',
              }}
              onMouseEnter={e => !isLoading && (e.target.style.transform = 'scale(1.02)')}
              onMouseLeave={e => !isLoading && (e.target.style.transform = 'scale(1)')}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Please wait...</span>
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Log In'
              )}
            </button>
          </form>
          {error && <p style={errorMessage}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;