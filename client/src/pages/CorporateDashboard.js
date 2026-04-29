import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTruck, FiHeart, FiVideo, FiTrendingDown, FiUsers, FiTarget, FiAward } from 'react-icons/fi';
import api from '../services/api'; // 🟢 This automatically handles Localhost vs. Hosted URL!
import './CorporateDashboard.css';

const CorporateDashboard = () => {
  const [companyName, setCompanyName] = useState('Partner Company');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCorporateData = async () => {
      const storedCompany = localStorage.getItem('companyName');

      if (storedCompany) {
        setCompanyName(storedCompany.charAt(0).toUpperCase() + storedCompany.slice(1));
        try {
          // 🟢 Uses your dynamic API service automatically
          const response = await api.get(`/corporate/stats/${storedCompany}`);
          setStats(response.data);
        } catch (error) {
          console.error("Failed to fetch corporate stats", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchCorporateData();
  }, []);

  if (loading) {
    return (
      <div className="gt-loading-container bg-dark text-white text-center py-5" style={{ minHeight: '100vh' }}>
        <Spinner animation="grow" variant="success" style={{ width: '4rem', height: '4rem' }} />
        <h4 className="mt-3">Loading Enterprise Analytics...</h4>
      </div>
    );
  }

  return (
    <div className="gt-dashboard-page" style={{
      backgroundImage: "linear-gradient(rgba(10, 25, 15, 0.85), rgba(10, 25, 15, 0.85)), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      <Container fluid className="gt-dashboard-container py-5">

        {/* HEADER */}
        <div className="text-center mb-5">
          <h2 className="gt-dashboard-title text-white fw-bold mb-2" style={{ fontSize: '3rem' }}>
            🏢 {companyName} ESG Command Center
          </h2>
          <div className="gt-title-underline"></div>
          <Badge bg="success" className="mt-3 p-2 fs-6 shadow">Verified Enterprise Partner</Badge>
        </div>

        {/* ROW 1: CORE ESG KPIs */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="gt-eco-card h-100 border-start border-success border-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="text-success"><FiTrendingDown size={30} /></div>
                  <Badge bg="success">YTD Total</Badge>
                </div>
                <h5 className="card-title text-white text-start uppercase">Total CO2 Reduced</h5>
                <p className="card-text fs-2 text-white fw-bold text-start mb-0">
                  {stats?.greenTrail?.totalCO2 || 0} <span className="fs-6 text-white-50">kg</span>
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="gt-eco-card h-100 border-start border-info border-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="text-info"><FiUsers size={30} /></div>
                  <Badge bg="info">Workforce</Badge>
                </div>
                <h5 className="card-title text-white text-start uppercase">Active Employees</h5>
                <p className="card-text fs-2 text-white fw-bold text-start mb-0">
                  {stats?.activeEmployees || 0} <span className="fs-6 text-white-50">Users</span>
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="gt-eco-card h-100 border-start border-warning border-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="text-warning"><FiAward size={30} /></div>
                  <Badge bg="warning" text="dark">Global</Badge>
                </div>
                <h5 className="card-title text-white text-start uppercase">Trees Sponsored</h5>
                <p className="card-text fs-2 text-white fw-bold text-start mb-0">
                  {stats?.greenTrail?.totalTrees || 0} <span className="fs-6 text-white-50">Planted</span>
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="gt-eco-card h-100 border-start border-light border-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="text-light"><FiTarget size={30} /></div>
                  <Badge bg="secondary">Goal: 2030</Badge>
                </div>
                <h5 className="card-title text-white text-start uppercase">ESG Compliance</h5>
                <p className="card-text fs-2 text-success fw-bold text-start mb-0">
                  On Track
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: GREENVERSE SUB-MODULE INTEGRATIONS */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="gt-eco-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FiTruck size={30} className="text-primary" />
                  <span className="text-white-50 fw-bold uppercase">Carpooling Integration</span>
                </div>
                <h2 className="text-white fw-bold">{stats?.carpooling?.totalRides || 0} Rides</h2>
                <p className="text-primary fw-bold mb-0">≈ {stats?.carpooling?.co2Saved || 0} kg CO2 saved</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="gt-eco-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FiHeart size={30} className="text-warning" />
                  <span className="text-white-50 fw-bold uppercase">Food Rescue Network</span>
                </div>
                <h2 className="text-white fw-bold">{stats?.foodWaste?.mealsSaved || 0} Meals</h2>
                <p className="text-warning fw-bold mb-0">{stats?.foodWaste?.totalDonations || 0} Active Donors</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="gt-eco-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <FiVideo size={30} style={{ color: '#9b59b6' }} />
                  <span className="text-white-50 fw-bold uppercase">GreenStream Training</span>
                </div>
                <h2 className="text-white fw-bold">{stats?.ecoLearn?.totalVideos || 0} Videos</h2>
                <p className="fw-bold mb-0" style={{ color: '#9b59b6' }}>{stats?.ecoLearn?.totalViews || 0} Total Employee Views</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ROW 3: DETAILED DEEP ANALYTICS */}
        <Row className="g-4 mb-5">
          <Col md={8}>
            <div className="gt-graph-wrapper p-4 rounded-4 shadow-lg h-100" style={{ background: 'rgba(15, 30, 20, 0.7)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 className="text-white mb-4 fw-bold">Yearly Fleet & Office Emissions vs Target (Tons)</h4>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.emissionTargets || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 30, 20, 0.9)', border: '1px solid #2ecc71', borderRadius: '10px', color: '#fff' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px', color: '#fff' }} />
                    <Line type="monotone" dataKey="target" stroke="#e74c3c" name="Target Ceiling" strokeWidth={3} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="actual" stroke="#2ecc71" name="Actual Emissions" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="gt-graph-wrapper p-4 rounded-4 shadow-lg h-100" style={{ background: 'rgba(15, 30, 20, 0.7)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 className="text-white mb-4 fw-bold">Offset by Department</h4>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.departmentData || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#ffffff" />
                    <YAxis dataKey="department" type="category" width={80} stroke="#ffffff" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 30, 20, 0.9)', border: '1px solid #3498db', borderRadius: '10px', color: '#fff' }} />
                    <Bar dataKey="offsetTons" fill="#3498db" name="CO2 Offset (Tons)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>

        {/* ROW 4: HISTORICAL IMPACT GROWTH */}
        <Row>
          <Col md={12}>
            <div className="gt-graph-wrapper p-4 rounded-4 shadow-lg" style={{ background: 'rgba(15, 30, 20, 0.7)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 className="text-center text-white mb-4 fw-bold">Historical Cross-Module Impact Growth</h4>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.trendData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="month" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 30, 20, 0.9)', border: '1px solid #2ecc71', borderRadius: '10px', color: '#fff' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px', color: '#fff' }} />
                    <Bar dataKey="rides" stackId="a" fill="#3498db" name="Carpool Rides" />
                    <Bar dataKey="food" stackId="a" fill="#f1c40f" name="Meals Saved" />
                    <Bar dataKey="trees" stackId="a" fill="#2ecc71" name="Trees Planted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default CorporateDashboard;