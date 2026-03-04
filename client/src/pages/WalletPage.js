import React, { useEffect, useState } from "react";
import api from "../services/api"; // Using centralized API service
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import "./WalletPage.css";

function WalletPage() {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        // CLEANED FOR HOSTING: Removed manual token and apiBaseUrl
        const response = await api.get("/profile/wallet-details");
        setWalletData(response.data);
      } catch (err) {
        setError("Failed to load wallet details.");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: "#2ecc71" }} />
        <p className="mt-3">Loading your GreenVerse Wallet...</p>
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

  const { totalCoins, breakdown } = walletData;

  return (
    <Container className="wallet-container">
      {/* Wallet Hero Section */}
      <div className="wallet-hero">
        <h1>My GreenCoin Wallet</h1>
        <div className="coin-display">
          <span className="coin-icon">🪙</span>
          <span className="coin-balance">{totalCoins}</span>
        </div>
        <p>GreenCoins are awarded for making sustainable choices across GreenVerse.</p>
      </div>

      <h3 className="breakdown-title">How You Earned Your Coins</h3>

      <Row className="g-4">
        {/* GreenTrail Card */}
        <Col md={6}>
          <Card className="wallet-card greentrail">
            <Card.Body>
              <div className="card-header-flex">
                <h4>🌳 GreenTrail</h4>
                <span className="earned-badge">+{breakdown.greenTrail.total} 🪙</span>
              </div>
              <ul className="reward-list">
                <li>
                  <span>Logged {breakdown.greenTrail.activitiesCount} footprint activities</span>
                  <span className="math-text">(1 coin per log)</span>
                </li>
                <li>
                  <span>Offset {breakdown.greenTrail.treesPlanted} trees via donations</span>
                  <span className="math-text">(4 coins per tree)</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Carpooling Card */}
        <Col md={6}>
          <Card className="wallet-card carpool">
            <Card.Body>
              <div className="card-header-flex">
                <h4>🚗 Carpooling</h4>
                <span className="earned-badge">+{breakdown.carpool.total} 🪙</span>
              </div>
              <ul className="reward-list">
                <li>
                  <span>Offered {breakdown.carpool.ridesOffered} shared rides</span>
                  <span className="math-text">(2 coins per ride)</span>
                </li>
                <li>
                  <span>Booked {breakdown.carpool.bookings} eco-friendly rides</span>
                  <span className="math-text">(2 coins per booking)</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Food Waste Card */}
        <Col md={6}>
          <Card className="wallet-card foodwaste">
            <Card.Body>
              <div className="card-header-flex">
                <h4>🍲 Food Rescue</h4>
                <span className="earned-badge">+{breakdown.foodWaste.total} 🪙</span>
              </div>
              <ul className="reward-list">
                <li>
                  <span>Rescued {breakdown.foodWaste.donationsCount} food donations</span>
                  <span className="math-text">(Accepted claims)</span>
                </li>
                <li>
                  <span>Prevented {breakdown.foodWaste.foodCarbonSaved} kg of CO₂</span>
                  <span className="math-text">(1 coin per 5kg CO₂)</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* EcoLearn Card */}
        <Col md={6}>
          <Card className="wallet-card ecolearn">
            <Card.Body>
              <div className="card-header-flex">
                <h4>📱 EcoLearn</h4>
                <span className="earned-badge">+{breakdown.ecoLearn.total} 🪙</span>
              </div>
              <ul className="reward-list">
                <li>
                  <span>Uploaded {breakdown.ecoLearn.videosCount} educational videos</span>
                </li>
                <li>
                  <span>Generated {breakdown.ecoLearn.videoViews} total views</span>
                  <span className="math-text">(1 coin per 50 views)</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default WalletPage;