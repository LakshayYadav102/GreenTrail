import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Container, 
  Table, 
  Spinner, 
  Alert, 
  Badge,
  ProgressBar,
  Card,
  Row,
  Col
} from "react-bootstrap";

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

  // Calculate min and max CO2 for progress bars
  const minCO2 = Math.min(...leaderboard.map(entry => entry.totalCO2 || 0));
  const maxCO2 = Math.max(...leaderboard.map(entry => entry.totalCO2 || 0));

  if (loading) {
    return (
      <Container className="text-center my-5 py-5">
        <Spinner animation="grow" variant="success" />
        <h5 className="mt-3 text-muted">Loading Eco Warriors...</h5>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center my-5">
        <Alert.Heading>Oh no! Something went wrong</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Container className="my-5">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-success text-white">
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="mb-0">
                <i className="bi bi-leaf me-2"></i>
                Eco Challenge Leaderboard
              </h3>
              <small className="text-white-50">Least Carbon Footprint Wins!</small>
            </Col>
            <Col md={4} className="text-md-end">
              <Badge bg="light" text="success" className="p-2">
                <i className="bi bi-tree me-1"></i> {leaderboard.length} Participants
              </Badge>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          {leaderboard.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th width="10%">Rank</th>
                    <th width="40%">Eco Warrior</th>
                    <th width="50%">
                      <i className="bi bi-bar-chart me-1"></i>
                      CO₂ Saved (kg)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={index} className={index < 3 ? "top-performer" : ""}>
                      <td>
                        {index === 0 ? (
                          <Badge bg="warning" text="dark" className="p-2">
                            <i className="bi bi-trophy me-1"></i> 1st
                          </Badge>
                        ) : index === 1 ? (
                          <Badge bg="secondary" className="p-2">
                            <i className="bi bi-trophy me-1"></i> 2nd
                          </Badge>
                        ) : index === 2 ? (
                          <Badge bg="danger" className="p-2">
                            <i className="bi bi-trophy me-1"></i> 3rd
                          </Badge>
                        ) : (
                          <span className="text-muted">{index + 1}</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-light text-success rounded-circle me-3 p-2">
                            <i className="bi bi-person"></i>
                          </div>
                          <div>
                            <h6 className="mb-0">{entry.username || "Eco Warrior"}</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1 me-3">
                            <ProgressBar 
                              now={entry.totalCO2 || 0} 
                              min={minCO2}
                              max={maxCO2}
                              variant={index === 0 ? "warning" : index === 1 ? "secondary" : index === 2 ? "danger" : "success"}
                              className="progress-green"
                              label={`${(entry.totalCO2 || 0).toFixed(2)} kg`}
                            />
                          </div>
                          <div className="text-end" style={{ minWidth: '80px' }}>
                            <Badge bg="light" text="dark" className="p-2">
                              {(entry.totalCO2 || 0).toFixed(2)} kg
                            </Badge>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                alt="No participants" 
                style={{ height: '100px', opacity: 0.7 }}
                className="mb-4"
              />
              <h5 className="text-muted">No participants yet</h5>
              <p className="text-muted">Be the first to join this eco challenge!</p>
            </div>
          )}
        </Card.Body>
        
        <Card.Footer className="text-muted text-center bg-light">
          <small>
            <i className="bi bi-tree me-1"></i> Every small action counts towards a greener planet
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Leaderboard;