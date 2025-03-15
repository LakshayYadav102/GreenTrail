import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

const Leaderboard = ({ challengeId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/challenges/leaderboard/${challengeId}`);
        setLeaderboard(response.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) {
      fetchLeaderboard();
    }
  }, [challengeId]);

  if (loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading leaderboard...</p>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger" className="text-center">{error}</Alert>;
  }

  return (
    <Container className="mt-4">
      <h3 className="text-center">Leaderboard (Least Carbon Footprint Wins!)</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Total CO₂ in Last 7 Days (kg)</th>
          </tr>
        </thead>
        <tbody>
  {leaderboard.length > 0 ? (
    leaderboard.map((entry, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{entry.username || "Unknown User"}</td> 
        <td>{entry.totalCO2?.toFixed(2) || "0.00"}</td> 
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center">No participants yet.</td>
    </tr>
  )}
</tbody>

      </Table>
    </Container>
  );
};

export default Leaderboard;
