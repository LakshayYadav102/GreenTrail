import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button, Alert } from "react-bootstrap";
import Leaderboard from "./Leaderboard"; // ✅ Import Leaderboard Component

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null); // ✅ Track selected challenge for leaderboard

  const userId = localStorage.getItem("userId"); // Get user ID from local storage

  // Fetch challenges from backend
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/challenges/");
        setChallenges(response.data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchChallenges();
  }, []);

  // Function to join a challenge
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

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Community Challenges</h2>

      {message && <Alert variant="info">{message}</Alert>}

      {challenges.length > 0 ? (
        challenges.map((challenge) => (
          <Card key={challenge._id} className="mb-4">
            <Card.Body>
              <Card.Title>{challenge.title}</Card.Title>
              <Card.Text>{challenge.description}</Card.Text>
              <Card.Text><strong>Goal:</strong> Reduce {challenge.goal} kg CO₂</Card.Text>
              <Card.Text><strong>Duration:</strong> {challenge.duration} days</Card.Text>
              <Button variant="success" className="me-2" onClick={() => joinChallenge(challenge._id)}>Join Challenge</Button>
              <Button 
                variant="info"
                onClick={() => setSelectedChallenge(challenge._id)} // ✅ Show leaderboard for selected challenge
              >
                View Leaderboard
              </Button>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-center">No challenges available.</p>
      )}

      {/* ✅ Show Leaderboard when a challenge is selected */}
      {selectedChallenge && (
        <Leaderboard challengeId={selectedChallenge} />
      )}
    </Container>
  );
};

export default Challenges;
