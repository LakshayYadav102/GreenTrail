// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import UserActivity from './UserActivity'; // User Activity Component
import GraphComponent from './GraphComponent'; // Graph Component

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Retrieve the userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setLoading(false);
    } else {
      setError('User not logged in');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Container className="mt-5">
        <Spinner animation="border" />
        <span className="ms-3">Loading...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Welcome to Your Dashboard</h2>

      {/* Graph Section */}
      <section className="graph-section mt-4">
        <h3>Your Carbon Footprint Over Time</h3>
        <GraphComponent userId={userId} /> {/* Pass the userId */}
      </section>

      {/* User Activity Section */}
      <section className="user-activity-section mt-5">
        <h3>Your Activities</h3>
        <UserActivity userId={userId} />
      </section>
    </Container>
  );
};

export default Dashboard;
