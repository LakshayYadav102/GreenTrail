// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      setMessage('Login successful!');
      setError('');
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Invalid credentials');
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
                </div>
              ) : (
                <>
                  Continue Journey
                  <FiArrowRight className="button-icon" />
                </>
              )}
            </Button>

            <div className="additional-options">
              <Button variant="link" className="eco-link" onClick={() => navigate('/register')}>
                Create New Trail
              </Button>
            </div>
          </Form>

          {message && (
            <Alert variant="success" className="eco-alert">
              <span className="alert-icon">🌱</span>
              {message}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="eco-alert">
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