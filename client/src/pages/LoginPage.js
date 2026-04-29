// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    setLoadingMessage('Connecting...');

    const wakeUpTimer = setTimeout(() => {
      setLoadingMessage('Waking up server, please wait...');
    }, 4000);

    try {
      const response = await api.post('/auth/login', { email, password });

      clearTimeout(wakeUpTimer);

      // 🟢 NEW: Extract role and companyName
      const { token, userId, role, companyName } = response.data;

      // Save auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);

      if (companyName) {
        localStorage.setItem('companyName', companyName);
      }

      // Notify App.jsx
      window.dispatchEvent(new Event('storage'));

      setMessage('Login successful! Redirecting...');
      setLoadingMessage('');

      await new Promise((resolve) => setTimeout(resolve, 300));

      // 🟢 NEW: Role-based navigation
      if (role === 'corporate') {
        navigate('/corporate-dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      clearTimeout(wakeUpTimer);
      console.error('Login Error:', err);

      if (!err.response) {
        setError('Server is unavailable. Please try again in a moment.');
      } else if (err.response.status === 401 || err.response.status === 400) {
        setError(err.response?.data?.message || 'Invalid credentials. Please check your email and password.');
      } else {
        setError('Something went wrong. Please try again.');
      }

      setLoadingMessage('');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="environmental-overlay"></div>
      <Container className="login-container">
        <div className="login-form-container">
          <div className="brand-container">
            <div className="brand-logo">🌿</div>
            <h1 className="brand-text">GreenVerse</h1>
            <p className="brand-tagline">Step into Sustainable Adventures</p>
          </div>

          <Form onSubmit={handleSubmit} className="eco-form">
            <Form.Group controlId="formBasicEmail" className="eco-form-group">
              <div className="input-decoration">
                <div className="input-icon">
                  <FiUser className="icon" />
                </div>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="eco-input"
                  disabled={isLoading}
                />
                <div className="input-highlight"></div>
              </div>
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="eco-form-group">
              <div className="input-decoration">
                <div className="input-icon">
                  <FiLock className="icon" />
                </div>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="eco-input"
                  disabled={isLoading}
                />
                <div className="input-highlight"></div>
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="mt-4 w-100 login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="leaf-spinner">
                  <div className="leaf">🌱</div>
                  {loadingMessage && (
                    <span style={{ fontSize: '0.75rem', marginLeft: '8px' }}>
                      {loadingMessage}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  Continue Journey
                  <FiArrowRight className="button-icon" />
                </>
              )}
            </Button>

            <div className="additional-options">
              <Button
                variant="link"
                className="eco-link"
                onClick={() => navigate('/register')}
                disabled={isLoading}
              >
                Create New Trail
              </Button>
            </div>
          </Form>

          {message && (
            <Alert variant="success" className="eco-alert mt-3">
              <span className="alert-icon">🌱</span>
              {message}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="eco-alert mt-3">
              <span className="alert-icon">⚠️</span>
              {error}
            </Alert>
          )}
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;