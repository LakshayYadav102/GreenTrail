import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
// Make sure this path points to your CSS file and Map component correctly
import '../components/DonationCard.css'; 
import MapWithNGOs from '../components/MapWithNGOs';

// Conditional imports for optional dependencies
let motion, AnimatePresence, FontAwesomeIcon, faLeaf, faTree, faMapMarkerAlt, faDonate, faHistory, faTimes, faCalculator;

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
  ({ faLeaf, faTree, faMapMarkerAlt, faDonate, faHistory, faTimes, faCalculator } = require('@fortawesome/free-solid-svg-icons'));
} catch (e) {
  console.warn('Font Awesome not installed. Icons disabled.');
  FontAwesomeIcon = ({ icon, ...props }) => <span {...props}>{icon?.iconName || ''}</span>;
}

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DonationPage = () => {
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
          axios.get(`${apiBaseUrl}/api/donations/lifetime-carbon/${userId}`),
          axios.get(`${apiBaseUrl}/api/donations/trees-needed/${userId}`),
          axios.get(`${apiBaseUrl}/api/donations/history/${userId}`)
        ]);

        setLifetimeCarbon(carbonRes.data.lifetimeCarbon ? parseFloat(carbonRes.data.lifetimeCarbon).toFixed(2) : 0);
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
      const response = await axios.post(`${apiBaseUrl}/api/donations/submit-transaction`, {
        userId,
        amount: parseFloat(amount),
        transactionId
      });
      setMessage(response.data.message || '🎉 Transaction submitted successfully!');
      setAmount('');
      setTransactionId('');

      const historyRes = await axios.get(`${apiBaseUrl}/api/donations/history/${userId}`);
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
      <div className="gt-don-loader-wrapper">
        <Spinner animation="border" variant="success" className="gt-don-spinner" />
        <p>Loading your eco journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gt-don-loader-wrapper">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="gt-don-page-wrapper">
      <div className="gt-don-bg-overlay"></div>
      
      <div className="gt-don-container">
        <div className="gt-don-header">
            <span className="gt-don-badge">Restoration Hub</span>
            <h1 className="gt-don-title">CARBON <span className="gt-don-highlight">OFFSET</span></h1>
            <p className="gt-don-subtitle">Neutralize your footprint by planting trees where they are needed most.</p>
        </div>

        <Row>
          {/* SIDEBAR */}
          <Col lg={3} md={4}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="gt-don-sidebar"
            >
              <h4 className="gt-don-sidebar-title">
                <FontAwesomeIcon icon={faLeaf} /> Navigation
              </h4>
              
              <button
                className={`gt-don-nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                <FontAwesomeIcon icon={faLeaf} className="me-2"/> Overview
              </button>
              
              <button
                className={`gt-don-nav-btn ${activeSection === 'donate' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection('donate');
                  setShowDonationPanel(true);
                }}
              >
                <FontAwesomeIcon icon={faDonate} className="me-2"/> Donate
              </button>
              
              <button
                className={`gt-don-nav-btn ${activeSection === 'history' ? 'active' : ''}`}
                onClick={() => setActiveSection('history')}
              >
                <FontAwesomeIcon icon={faHistory} className="me-2"/> History
              </button>
              
              <button
                className={`gt-don-nav-btn ${activeSection === 'map' ? 'active' : ''}`}
                onClick={() => setActiveSection('map')}
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2"/> NGO Map
              </button>
            </motion.div>
          </Col>

          {/* MAIN CONTENT AREA */}
          <Col lg={9} md={8}>
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="gt-don-card mb-4">
                    <div className="gt-don-card-body">
                      <h3 className="gt-don-card-title">
                        <FontAwesomeIcon icon={faLeaf} /> Your Offset Progress
                      </h3>
                      
                      <div className="gt-don-stats-grid">
                        <div className="gt-don-stat-box">
                          <span className="gt-don-stat-label">Lifetime Footprint</span>
                          <span className="gt-don-stat-value text-danger">{lifetimeCarbon} <small>kg CO₂</small></span>
                        </div>
                        <div className="gt-don-stat-box">
                          <span className="gt-don-stat-label">Trees Required</span>
                          <span className="gt-don-stat-value text-warning">{treesNeeded} <small>Trees</small></span>
                        </div>
                        <div className="gt-don-stat-box">
                          <span className="gt-don-stat-label">Trees Sponsored</span>
                          <span className="gt-don-stat-value text-success">{treesPlanted} <small>Trees</small></span>
                        </div>
                      </div>

                      <div className="gt-don-progress-section">
                        <div className="gt-don-progress-label">
                           <span>Restoration Goal</span>
                           <span>{treesNeeded > 0 ? Math.round((treesPlanted / treesNeeded) * 100) : 0}% Offset</span>
                        </div>
                        <div className="gt-don-progress-track">
                            <div 
                                className="gt-don-progress-fill" 
                                style={{ width: `${treesNeeded > 0 ? Math.min((treesPlanted / treesNeeded) * 100, 100) : 0}%` }}
                            ></div>
                        </div>
                      </div>

                      <div className="text-center mt-5">
                          <button
                            className="gt-don-action-btn primary"
                            onClick={() => {
                              setShowDonationPanel(true);
                              setActiveSection('donate');
                            }}
                          >
                            FUND RESTORATION
                          </button>
                      </div>
                    </div>
                  </div>
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
                  <div className="gt-don-card mb-4">
                    <div className="gt-don-card-body">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                          <h3 className="gt-don-card-title m-0">
                            <FontAwesomeIcon icon={faDonate} className="me-2"/> Plant a Tree
                          </h3>
                          <button
                            className="gt-don-close-btn"
                            onClick={() => setActiveSection('overview')}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                      </div>

                      <Form.Group controlId="donationAmount" className="gt-don-form-group">
                        <Form.Label className="gt-don-label">Donation Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter amount (Minimum ₹100)"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="100"
                          className="gt-don-input"
                        />
                      </Form.Group>

                      {amount && parseFloat(amount) >= 100 && (
                        <div className="gt-don-qr-section">
                          <h6>Scan to Fund</h6>
                          <div className="gt-don-qr-box">
                              <QRCodeCanvas
                                value={`upi://pay?pa=lakshay9718@okhdfcbank&pn=Lakshay&am=${amount}&cu=INR`}
                                size={180}
                              />
                          </div>
                          <p className="gt-don-upi-text">UPI: lakshay9718@okhdfcbank</p>
                        </div>
                      )}

                      <Form.Group controlId="transactionId" className="gt-don-form-group">
                        <Form.Label className="gt-don-label">Transaction ID / UTR</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter 12-digit transaction ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="gt-don-input"
                        />
                      </Form.Group>

                      <div className="gt-don-impact-preview">
                        <span className="gt-don-impact-icon">🌱</span>
                        Your ₹{amount || 0} will sponsor approximately <strong>{calculateTreesFromAmount()}</strong> trees.
                      </div>

                      <button
                        className="gt-don-action-btn primary w-100 mt-3"
                        onClick={handleSubmitTransaction}
                        disabled={!amount || parseFloat(amount) < 100 || !transactionId}
                      >
                        VERIFY TRANSACTION
                      </button>
                      
                      {message && <div className="gt-don-alert mt-3">{message}</div>}
                    </div>
                  </div>

                  <div className="gt-don-card mb-4 secondary">
                    <div className="gt-don-card-body">
                      <h4 className="gt-don-card-title mb-3">Where does your money go?</h4>
                      <ul className="gt-don-info-list">
                        <li><span className="bullet"></span><strong>70% Tree Planting:</strong> Direct funding for saplings and local farmers.</li>
                        <li><span className="bullet"></span><strong>20% Maintenance:</strong> Watering and care for the first 3 crucial years.</li>
                        <li><span className="bullet"></span><strong>10% Operations:</strong> Monitoring, tech infrastructure, and transparency reporting.</li>
                      </ul>
                    </div>
                  </div>
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
                  <div className="gt-don-card mb-4">
                    <div className="gt-don-card-body">
                      <h3 className="gt-don-card-title mb-4">
                        <FontAwesomeIcon icon={faHistory} className="me-2"/> Transaction History
                      </h3>
                      
                      {donationHistory.length > 0 ? (
                        <div className="gt-don-history-list">
                          {donationHistory.map((donation, index) => (
                            <div key={index} className="gt-don-history-item">
                               <div className="gt-don-history-icon"><FontAwesomeIcon icon={faTree} /></div>
                               <div className="gt-don-history-details">
                                  <strong>Sponsored {donation.treesSponsored || Math.floor(donation.amount/100)} Trees</strong>
                                  <span>₹{donation.amount} • {new Date(donation.date).toLocaleDateString()}</span>
                               </div>
                               <div className="gt-don-history-txn">
                                  Txn: {donation.transactionId || 'N/A'}
                               </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="gt-don-empty-state">
                           <div className="empty-icon">🍃</div>
                           <p>No records found. Start your restoration journey today.</p>
                        </div>
                      )}
                    </div>
                  </div>
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
                  <div className="gt-don-card mb-4">
                    <div className="gt-don-card-body">
                      <h3 className="gt-don-card-title mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2"/> Global NGO Network
                      </h3>
                      <p className="gt-don-text mb-4">
                        Discover where our verified partners are actively restoring ecosystems.
                      </p>
                      <div className="gt-don-map-wrapper">
                        <MapWithNGOs />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Informational Footer Card */}
            <div className="gt-don-card secondary mb-4 mt-4">
              <div className="gt-don-card-body">
                <h4 className="gt-don-card-title mb-3">
                    <FontAwesomeIcon icon={faCalculator} className="me-2"/> The Math Behind The Offset
                </h4>
                <p className="gt-don-text mb-2">
                  Your <strong>Lifetime Carbon Footprint</strong> is currently calculated at <strong className="text-danger">{lifetimeCarbon} kg CO₂</strong>.
                </p>
                <p className="gt-don-text m-0">
                  On average, a mature tree absorbs roughly <strong>21 kg of CO₂ per year</strong>. We calculate your required offset by dividing your total footprint by this absorption rate.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DonationPage;