// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeField, setActiveField] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    setLoadingMessage('Creating your account...');

    // Show "waking up server" message after 4 seconds if still loading
    const wakeUpTimer = setTimeout(() => {
      setLoadingMessage('Waking up server, please wait...');
    }, 4000);

    try {
      await api.post('/auth/register', formData);

      clearTimeout(wakeUpTimer);
      setLoadingMessage('');
      setMessage('Registration successful! Redirecting to login...');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      clearTimeout(wakeUpTimer);
      console.error('Registration Error:', err);

      if (!err.response) {
        // Network error — server unreachable even after retries
        setError('Server is unavailable. Please try again in a moment.');
      } else if (err.response.status === 409 || err.response.status === 400) {
        // Conflict (email/username already exists) or bad request
        setError(err.response?.data?.message || 'This email or username is already taken.');
      } else {
        setError('Registration failed. Please try again.');
      }

      setLoadingMessage('');
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="register-page">
      <div className="environmental-overlay"></div>
      <Container className="register-container">
        <div className="register-form-container">
          <div className="brand-container">
            <div className="brand-logo">🌿</div>
            <h1 className="brand-text">GreenVerse</h1>
            <p className="brand-tagline">Begin Your Sustainable Journey</p>
          </div>

          <Form onSubmit={handleSubmit} className="eco-form">
            <Form.Group controlId="username" className="eco-form-group">
              <div className="input-decoration">
                <div className="input-icon">
                  <FiUser className="icon" />
                </div>
                <Form.Control
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setActiveField('username')}
                  onBlur={() => setActiveField('')}
                  required
                  className="eco-input"
                  disabled={isLoading}
                />
                <div className="input-highlight"></div>
              </div>
            </Form.Group>

            <Form.Group controlId="email" className="eco-form-group">
              <div className="input-decoration">
                <div className="input-icon">
                  <FiMail className="icon" />
                </div>
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField('')}
                  required
                  className="eco-input"
                  disabled={isLoading}
                />
                <div className="input-highlight"></div>
              </div>
            </Form.Group>

            <Form.Group controlId="password" className="eco-form-group">
              <div className="input-decoration">
                <div className="input-icon">
                  <FiLock className="icon" />
                </div>
                <Form.Control
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField('')}
                  required
                  className="eco-input"
                  disabled={isLoading}
                />
                <div className="input-highlight"></div>
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="mt-4 w-100 register-button"
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
                'Create Account'
              )}
            </Button>

            <div className="additional-options">
              <Button
                variant="link"
                className="eco-link"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Already have an account? Sign In
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

export default RegisterPage;