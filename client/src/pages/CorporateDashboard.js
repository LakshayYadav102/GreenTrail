import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';

// IMPORT SUB-COMPONENTS
import CorporateNavbar from './CorporateNavbar';
import ESGAnalyticsView from './ESGAnalyticsView';
import VerificationHub from './VerificationHub';
import FacilityCalculator from './FacilityCalculator';
import './CorporateDashboard.css';

const CorporateDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [companyName, setCompanyName] = useState('Partner Company');
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCorporateData = async () => {
      const storedCompany = localStorage.getItem('companyName') || 'techcorp';
      setCompanyName(storedCompany.charAt(0).toUpperCase() + storedCompany.slice(1));
      
      try {
        const response = await api.get(`/corporate/stats/${storedCompany}`);
        setStats(response.data);

        // Fetch verification queue
        const verificationRes = await api.get(`/corporate/pending-verifications/${storedCompany}`);
        const formattedEmployees = (verificationRes.data || []).map(emp => ({
          ...emp,
          verificationStatus: emp.commuteVerificationStatus || 'pending'
        }));
        setEmployees(formattedEmployees);
      } catch (error) {
        setError('Unable to load real-time analytics. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchCorporateData();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to securely log out of the ESG Command Center?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleVerifyEmployee = async (employeeId, distance) => {
    try {
      await api.put(`/corporate/verify-employee/${employeeId}`, {
        verifiedDistanceToOffice: distance,
        credibilityScore: 4.5 
      });
      setEmployees(prev => prev.map(emp => emp._id === employeeId ? { ...emp, verificationStatus: 'verified', credibilityScore: 4.5 } : emp));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectEmployee = async (employeeId) => {
    try {
      await api.put(`/corporate/reject-employee/${employeeId}`);
      setEmployees(prev => prev.map(emp => emp._id === employeeId ? { ...emp, verificationStatus: 'rejected', credibilityScore: 1.0 } : emp));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="bg-dark text-white text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Spinner animation="grow" variant="success" style={{ width: '4rem', height: '4rem' }} />
      <h4 className="mt-3">Loading Database Analytics...</h4>
    </div>
  );

  if (error || !stats) return (
    <Container className="py-5 mt-5">
      <Alert variant="danger"><h4>Data Sync Error</h4><p>{error}</p></Alert>
    </Container>
  );

  return (
    <div className="gt-dashboard-page" style={{
      backgroundImage: "linear-gradient(rgba(10, 25, 15, 0.85), rgba(10, 25, 15, 0.85)), url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed',
      minHeight: '100vh', paddingBottom: '5rem'
    }}>
      
      {/* 🟢 TOP NAVIGATION FOR AUDITOR */}
      <CorporateNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        companyName={companyName} 
      />

      <Container fluid className="gt-dashboard-container pt-3 pb-5">
        {/* Render content based on selected tab */}
        {activeTab === 'dashboard' && <ESGAnalyticsView stats={stats} companyName={companyName} />}
        
        {activeTab === 'verification' && (
          <VerificationHub 
            employees={employees} 
            handleVerifyEmployee={handleVerifyEmployee} 
            handleRejectEmployee={handleRejectEmployee} 
          />
        )}
        
        {activeTab === 'calculator' && <FacilityCalculator />}
      </Container>
    </div>
  );
};

export default CorporateDashboard;