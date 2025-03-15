import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [activeField, setActiveField] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage({ 
        text: 'Registration successful! Redirecting to login...', 
        type: 'success' 
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Registration failed. Please try again.', 
        type: 'danger' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="eco-register-container">
      <div className="eco-background">
        <div className="leaf-pattern"></div>
      </div>

      <Container className="eco-form-container">
        <div className="eco-card">
          <div className="eco-card-header">
            <h2>
              <span className="eco-icon">🌿</span>
              Join EcoTrack
            </h2>
            <p className="eco-subtitle">Start your sustainability journey</p>
          </div>

          <Form onSubmit={handleSubmit} className="eco-form">
            <Form.Group controlId="username" className="eco-input-group">
              <Form.Control
                name="username"
                type="text"
                className="eco-input"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setActiveField('username')}
                onBlur={() => setActiveField('')}
                required
              />
             <label className={`eco-label ${(activeField === 'username' || formData.username) ? 'active' : ''}`}>
  Username
</label>
            </Form.Group>

            <Form.Group controlId="email" className="eco-input-group">
              <Form.Control
                name="email"
                type="email"
                className="eco-input"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField('')}
                required
              />
              <label className={`eco-label ${(activeField === 'email' || formData.email) ? 'active' : ''}`}>
  Email Address
</label>
                
            </Form.Group>

            <Form.Group controlId="password" className="eco-input-group">
              <Form.Control
                name="password"
                type="password"
                className="eco-input"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setActiveField('password')}
                onBlur={() => setActiveField('')}
                required
              />
              <label className={`eco-label ${(activeField === 'password' || formData.password) ? 'active' : ''}`}>
                Password
              </label>
            </Form.Group>

            <Button 
              type="submit" 
              className="eco-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner 
                  animation="border" 
                  role="status"
                  className="eco-spinner"
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                'Create Account'
              )}
            </Button>
          </Form>

          {message.text && (
            <Alert variant={message.type} className="eco-alert">
              {message.text}
            </Alert>
          )}
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;