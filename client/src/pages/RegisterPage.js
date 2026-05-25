import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUser, FiMail, FiLock, FiBriefcase, FiGrid } from 'react-icons/fi';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    companyName: '', // New field
    department: 'General' // New field
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

    const wakeUpTimer = setTimeout(() => {
      setLoadingMessage('Waking up server, please wait...');
    }, 4000);

    try {
      // 🟡 The companyName is converted to lowercase so the backend stats tracker matches it perfectly
      const dataToSubmit = {
        ...formData,
        companyName: formData.companyName.toLowerCase().trim()
      };

      await api.post('/auth/register', dataToSubmit);

      clearTimeout(wakeUpTimer);
      setLoadingMessage('');
      setMessage('Registration successful! Redirecting to login...');
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      clearTimeout(wakeUpTimer);
      console.error('Registration Error:', err);

      if (!err.response) {
        setError('Server is unavailable. Please try again in a moment.');
      } else if (err.response.status === 409 || err.response.status === 400) {
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
                <div className="input-icon"><FiUser className="icon" /></div>
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
                <div className="input-icon"><FiMail className="icon" /></div>
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
                <div className="input-icon"><FiLock className="icon" /></div>
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

            {/* 🟡 NEW: Company Name Field */}
            <Form.Group controlId="companyName" className="eco-form-group">
              <div className="input-decoration">
                <div className="input-icon"><FiBriefcase className="icon" /></div>
                <Form.Control
                  name="companyName"
                  type="text"
                  placeholder="Company Name (Optional)"
                  value={formData.companyName}
                  onChange={handleChange}
                  onFocus={() => setActiveField('companyName')}
                  onBlur={() => setActiveField('')}
                  className="eco-input"
                  disabled={isLoading}
                />
                <div className="input-highlight"></div>
              </div>
            </Form.Group>

            {/* 🟡 NEW: Department Dropdown */}
            {formData.companyName && (
              <Form.Group controlId="department" className="eco-form-group">
                <div className="input-decoration">
                  <div className="input-icon"><FiGrid className="icon" /></div>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="eco-input"
                    disabled={isLoading}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none' }}
                  >
                    <option value="General" style={{ color: '#000' }}>General / No Department</option>
                    <option value="Engineering" style={{ color: '#000' }}>Engineering</option>
                    <option value="Sales" style={{ color: '#000' }}>Sales</option>
                    <option value="HR & Admin" style={{ color: '#000' }}>HR & Admin</option>
                    <option value="Marketing" style={{ color: '#000' }}>Marketing</option>
                    <option value="Operations" style={{ color: '#000' }}>Operations</option>
                    <option value="Finance" style={{ color: '#000' }}>Finance</option>
                  </Form.Select>
                  <div className="input-highlight"></div>
                </div>
              </Form.Group>
            )}

            <Button type="submit" className="mt-4 w-100 register-button" disabled={isLoading}>
              {isLoading ? (
                <div className="leaf-spinner">
                  <div className="leaf">🌱</div>
                  {loadingMessage && <span style={{ fontSize: '0.75rem', marginLeft: '8px' }}>{loadingMessage}</span>}
                </div>
              ) : 'Create Account'}
            </Button>

            <div className="additional-options">
              <Button variant="link" className="eco-link" onClick={() => navigate('/login')} disabled={isLoading}>
                Already have an account? Sign In
              </Button>
            </div>
          </Form>

          {message && (
            <Alert variant="success" className="eco-alert mt-3"><span className="alert-icon">🌱</span>{message}</Alert>
          )}
          {error && (
            <Alert variant="danger" className="eco-alert mt-3"><span className="alert-icon">⚠️</span>{error}</Alert>
          )}
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;