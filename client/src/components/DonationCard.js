import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Spinner, ListGroup, Row, Col, Alert, ProgressBar } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import './DonationCard.css';
import MapWithNGOs from './MapWithNGOs';

// Conditional imports for optional dependencies
let motion, AnimatePresence, FontAwesomeIcon, faLeaf, faTree, faMapMarkerAlt, faDonate, faHistory, faTimes;

try {
  motion = require('framer-motion').motion;
  AnimatePresence = require('framer-motion').AnimatePresence;
} catch (e) {
  console.warn('Framer Motion not installed. Animations disabled.');
  motion = { div: 'div' };
  AnimatePresence = ({ children }) => <>{children}</>;
}
try {
  FontAwesomeIcon = require('@fortawesome/react-fontawesome').FontAwesomeIcon;
  ({ faLeaf, faTree, faMapMarkerAlt, faDonate, faHistory, faTimes } = require('@fortawesome/free-solid-svg-icons'));
} catch (e) {
  console.warn('Font Awesome not installed. Icons disabled.');
  FontAwesomeIcon = ({ icon, ...props }) => <span {...props}>{icon?.iconName || ''}</span>;
}

const DonationCard = () => {
  const [lifetimeCarbon, setLifetimeCarbon] = useState(0);
  const [treesNeeded, setTreesNeeded] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [donationHistory, setDonationHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDonationPanel, setShowDonationPanel] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [carbonRes, treesRes, historyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/donations/lifetime-carbon/${userId}`),
          axios.get(`http://localhost:5000/api/donations/trees-needed/${userId}`),
          axios.get(`http://localhost:5000/api/donations/history/${userId}`)
        ]);

        setLifetimeCarbon(carbonRes.data.lifetimeCarbon || 0);
        setTreesNeeded(treesRes.data.treesNeeded || 0);

        const donations = Array.isArray(historyRes.data.donations) ? historyRes.data.donations : [];
        setDonationHistory(donations);
        const calculatedTrees = donations.reduce((sum, d) => sum + (d.treesSponsored || 0), 0);
        setTreesPlanted(calculatedTrees);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmitTransaction = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || !amount || !transactionId || parseFloat(amount) < 100) {
      setMessage('Please enter a valid donation amount (minimum ₹100) and transaction ID');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/donations/submit-transaction', {
        userId,
        amount: parseFloat(amount),
        transactionId
      });
      setMessage(response.data.message || '🎉 Transaction submitted successfully!');
      setAmount('');
      setTransactionId('');

      const historyRes = await axios.get(`http://localhost:5000/api/donations/history/${userId}`);
      const donations = Array.isArray(historyRes.data.donations) ? historyRes.data.donations : [];
      setDonationHistory(donations);
      const calculatedTrees = donations.reduce((sum, d) => sum + (d.treesSponsored || 0), 0);
      setTreesPlanted(calculatedTrees);
    } catch (err) {
      console.error('Transaction submission failed:', err);
      setMessage(err.response?.data?.error || '❌ Transaction submission failed.');
    }
  };

  const calculateTreesFromAmount = () => Math.floor(parseFloat(amount) / 100) || 0;

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your eco journey...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Alert variant="danger" className="text-center">{error}</Alert>
      </motion.div>
    );
  }

  return (
    <div className="donation-container">
      <Container fluid className="position-relative">
        <Row>
          <Col md={3} className="sidebar">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="sidebar-content"
            >
              <h4 className="sidebar-title">
                <FontAwesomeIcon icon={faLeaf} /> Eco Dashboard
              </h4>
              <Button
                variant={activeSection === 'overview' ? 'success' : 'outline-success'}
                className="w-100 mb-2"
                onClick={() => setActiveSection('overview')}
              >
                <FontAwesomeIcon icon={faLeaf} /> Overview
              </Button>
              <Button
                variant={activeSection === 'donate' ? 'success' : 'outline-success'}
                className="w-100 mb-2"
                onClick={() => {
                  setActiveSection('donate');
                  setShowDonationPanel(true);
                }}
              >
                <FontAwesomeIcon icon={faDonate} /> Donate
              </Button>
              <Button
                variant={activeSection === 'history' ? 'success' : 'outline-success'}
                className="w-100 mb-2"
                onClick={() => setActiveSection('history')}
              >
                <FontAwesomeIcon icon={faHistory} /> History
              </Button>
              <Button
                variant={activeSection === 'map' ? 'success' : 'outline-success'}
                className="w-100 mb-2"
                onClick={() => setActiveSection('map')}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} /> NGO Map
              </Button>
            </motion.div>
          </Col>

          <Col md={9} className="main-content">
            <AnimatePresence>
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="eco-card text-center mb-4">
                    <Card.Body>
                      <Card.Title>
                        <FontAwesomeIcon icon={faLeaf} /> Offset Your Carbon Footprint
                      </Card.Title>
                      <Card.Text>
                        <strong>Lifetime Carbon Footprint:</strong> {lifetimeCarbon} kg CO₂<br />
                        <strong>Trees Needed to Offset:</strong> {treesNeeded}
                      </Card.Text>
                      <ProgressBar
                        now={treesNeeded > 0 ? (treesPlanted / treesNeeded) * 100 : 0}
                        label={`${treesNeeded > 0 ? Math.round((treesPlanted / treesNeeded) * 100) : 0}% Offset`}
                        variant="success"
                        className="mb-3"
                      />
                      <Button
                        variant="success"
                        onClick={() => {
                          setShowDonationPanel(true);
                          setActiveSection('donate');
                        }}
                      >
                        Make a Donation
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'donate' && (
                <motion.div
                  key="donate"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="eco-card mb-4">
                    <Card.Body>
                      <h5>
                        <FontAwesomeIcon icon={faDonate} /> Donate to Offset
                        <Button
                          variant="link"
                          className="float-end"
                          onClick={() => setShowDonationPanel(false)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </h5>
                      <Form.Group controlId="donationAmount">
                        <Form.Label>Donation Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter amount (minimum ₹100)"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="100"
                          className="mb-3"
                        />
                      </Form.Group>
                      {amount && parseFloat(amount) >= 100 && (
                        <div className="text-center mb-3">
                          <h6>Scan to Pay</h6>
                          <QRCodeCanvas
                            value={`upi://pay?pa=lakshay9718@okhdfcbank&pn=Lakshay&am=${amount}&cu=INR`}
                            size={200}
                          />
                          <p className="mt-2">UPI ID: lakshay9718@okhdfcbank</p>
                        </div>
                      )}
                      <Form.Group controlId="transactionId">
                        <Form.Label>Transaction ID</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter transaction ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="mb-3"
                        />
                      </Form.Group>
                      <p className="impact-calculator">
                        Your ₹{amount || 0} donation will plant approximately{' '}
                        <strong>{calculateTreesFromAmount()}</strong> trees!
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleSubmitTransaction}
                        disabled={!amount || parseFloat(amount) < 100 || !transactionId}
                      >
                        Submit Transaction
                      </Button>
                      {message && <p className="mt-3 text-info">{message}</p>}
                    </Card.Body>
                  </Card>

                  <Card className="eco-card mb-4">
                    <Card.Body>
                      <h5><FontAwesomeIcon icon={faDonate} /> Why Donate?</h5>
                      <div>
                        <p>
                          Your donations fund initiatives to combat climate change and promote sustainability:
                        </p>
                        <ul>
                          <li><strong>Tree Planting (70%):</strong> Funds planting in deforested areas and urban spaces.</li>
                          <li><strong>Reforestation (20%):</strong> Restores ecosystems with verified NGOs.</li>
                          <li><strong>Operational Costs (10%):</strong> Ensures transparency and monitoring.</li>
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="eco-card mb-4">
                    <Card.Body>
                      <h5><FontAwesomeIcon icon={faHistory} /> Your Donation History</h5>
                      {donationHistory.length > 0 ? (
                        <ListGroup>
                          {donationHistory.map((donation, index) => (
                            <ListGroup.Item key={index} className="history-item">
                              <FontAwesomeIcon icon={faDonate} className="me-2" />
                              ₹{donation.amount} on {new Date(donation.date).toLocaleDateString()} (Transaction ID: {donation.transactionId || 'N/A'})
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      ) : (
                        <p>No donations yet. Start your eco journey today!</p>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              )}

              {activeSection === 'map' && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="eco-card mb-4">
                    <Card.Body>
                      <h5><FontAwesomeIcon icon={faMapMarkerAlt} /> Explore Our NGO Partners</h5>
                      <div>
                        <p>
                          The map showcases our network of NGOs dedicated to tree planting and reforestation. Click markers to learn about each project.
                        </p>
                        <ul>
                          <li><strong>NGO Locations:</strong> Global and local partners.</li>
                          <li><strong>Project Sites:</strong> Active planting areas.</li>
                          <li><strong>Impact Areas:</strong> Regions benefiting from your donations.</li>
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                  <Card className="eco-card">
                    <Card.Body>
                      <MapWithNGOs />
                    </Card.Body>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Card className="eco-card mb-4">
              <Card.Body>
                <h5><FontAwesomeIcon icon={faTree} /> How We Calculate Trees Needed</h5>
                <div>
                  <p>
                    Your <strong>Lifetime Carbon Footprint</strong> ({lifetimeCarbon} kg CO₂) is based on your tracked activities.
                  </p>
                  <p>
                    We estimate trees needed using: Trees = Carbon Footprint ÷ 21 kg CO₂/tree. For you: {lifetimeCarbon} kg ÷ 21 ≈ {treesNeeded} trees.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DonationCard;