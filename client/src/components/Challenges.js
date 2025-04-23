import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Alert, Form } from "react-bootstrap";
import Leaderboard from "./Leaderboard";

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challengeSelection, setChallengeSelection] = useState(""); // For dropdown

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/challenges/");
        setChallenges(response.data);
        console.log("Fetched challenges:", response.data); // Debug log
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchChallenges();
  }, []);

  const joinChallenge = async (challengeId) => {
    try {
      const response = await axios.post("http://localhost:5000/api/challenges/join", {
        userId,
        challengeId,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error joining challenge:", error);
      setMessage("Failed to join challenge. Try again!");
    }
  };

  const handleChallengeSelect = (e) => {
    setChallengeSelection(e.target.value);
    setSelectedChallenge(e.target.value || null); // Update selected challenge for leaderboard
  };

  return (
    <Container className="mt-5 eco-container">
      <h2 className="text-center mb-4">Community Challenges</h2>

      {message && <Alert variant="info">{message}</Alert>}

      <Form.Group controlId="challengeSelect" className="eco-form-group mb-4">
        <Form.Label className="form-label">Challenges</Form.Label>
        <Form.Control
          as="select"
          name="challenge"
          value={challengeSelection}
          onChange={handleChallengeSelect}
          className="eco-input"
        >
          <option value="">Select a Challenge (Optional)</option>
          {/* Static options for testing */}
          <option value="test1">Test Challenge 1</option>
          <option value="test2">Test Challenge 2</option>
          {/* Dynamic options */}
          {challenges.map((challenge) => (
            <option key={challenge._id} value={challenge._id}>
              {challenge.title}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {challenges.length > 0 ? (
        challenges.map((challenge) => (
          <Card key={challenge._id} className="mb-4 eco-card">
            <Card.Body>
              <Card.Title>{challenge.title}</Card.Title>
              <Card.Text>{challenge.description}</Card.Text>
              <Card.Text><strong>Goal:</strong> Reduce {challenge.goal} kg CO₂</Card.Text>
              <Card.Text><strong>Duration:</strong> {challenge.duration} days</Card.Text>
              <Button variant="success" className="me-2" onClick={() => joinChallenge(challenge._id)}>
                Join Challenge
              </Button>
              <Button
                variant="info"
                onClick={() => setSelectedChallenge(challenge._id)}
              >
                View Leaderboard
              </Button>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-center">No challenges available.</p>
      )}

      {selectedChallenge && <Leaderboard challengeId={selectedChallenge} />}
    </Container>
  );
};

export default Challenges;