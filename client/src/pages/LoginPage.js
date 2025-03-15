import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Import the updated CSS

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

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      console.log('Login Response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);

      setMessage('Login successful!');
      setError('');
      navigate('/dashboard');
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
      <Container className="login-container">
        <div className="login-form-container">
          <h3>Login to <span className="brand">GreenTrail</span></h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-4 w-100 login-button" disabled={isLoading}>
              {isLoading ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>

            {/* ✅ Added "Go to Home" Button */}
            <Button variant="secondary" className="mt-3 w-100 home-button" onClick={() => navigate("/")}>
              🏠 Go to Home
            </Button>
          </Form>

          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
