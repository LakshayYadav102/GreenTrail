import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FiLogOut, FiPieChart, FiShield, FiCpu } from 'react-icons/fi';

const CorporateNavbar = ({ activeTab, setActiveTab, onLogout, companyName }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-success mb-4 px-3" style={{ background: 'rgba(15,30,20,0.9)' }}>
      <Container fluid>
        <Navbar.Brand className="fw-bold text-success" style={{ letterSpacing: '1px' }}>
          🌿 {companyName} ESG Command
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="corporate-navbar-nav" />
        <Navbar.Collapse id="corporate-navbar-nav">
          <Nav className="mx-auto gap-3">
            <Nav.Link 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'text-white fw-bold border-bottom border-2 border-success' : 'text-white-50'}
            >
              <FiPieChart className="me-2" /> ESG Metrics
            </Nav.Link>
            
            <Nav.Link 
              active={activeTab === 'verification'} 
              onClick={() => setActiveTab('verification')}
              className={activeTab === 'verification' ? 'text-white fw-bold border-bottom border-2 border-success' : 'text-white-50'}
            >
              <FiShield className="me-2" /> Verification Hub
            </Nav.Link>

            <Nav.Link 
              active={activeTab === 'calculator'} 
              onClick={() => setActiveTab('calculator')}
              className={activeTab === 'calculator' ? 'text-white fw-bold border-bottom border-2 border-success' : 'text-white-50'}
            >
              <FiCpu className="me-2" /> Facility Calculator
            </Nav.Link>
          </Nav>
          <Button variant="outline-danger" size="sm" onClick={onLogout} className="d-flex align-items-center fw-bold rounded-pill px-3">
            <FiLogOut className="me-2" /> Secure Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CorporateNavbar;