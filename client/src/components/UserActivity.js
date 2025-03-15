import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Button, Row, Col } from 'react-bootstrap';
import GraphComponent from './GraphComponent';  // Import the GraphComponent
import './UserActivity.css';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Get userId from localStorage

    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    const fetchUserActivities = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/activities/user/${userId}`);
        setActivities(response.data); // Set fetched activities
      } catch (err) {
        setError('Error fetching activities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivities();
  }, []);

  if (loading) {
    return <div className="text-center">Loading your activities...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Your Activity History</h2>

      {/* Display GraphComponent */}
      <GraphComponent userId={localStorage.getItem('userId')} />

      {activities.length > 0 ? (
        activities.map((activity) => (
          <Card key={activity._id} className="mb-4 user-activity-card">
            <Card.Body>
              <Card.Title className="text-center">Activity Details</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>From Date:</strong> {new Date(activity.fromDate).toLocaleDateString()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>To Date:</strong> {new Date(activity.toDate).toLocaleDateString()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Transportation:</strong> {activity.transportation} km
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Diet:</strong> {activity.diet}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Energy Usage:</strong> {activity.energy} kWh
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Emission:</strong> {activity.totalEmission} kg CO2
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="text-center">
          <p>No activities found.</p>
        </div>
      )}

      <Row className="justify-content-center mt-4">
        <Col md={4} className="text-center">
          <Button variant="primary" href="/dashboard" className="btn">
            Back to Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default UserActivity;
