import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import DonationCard from '../components/DonationCard';
import './DashboardPage.css'; // Reuse dashboard styles for consistency

const DonationPage = () => {
  return (
    <Container className="dashboard-container my-5">
      <h1 className="dashboard-title">
        Plant Trees to Offset Your Carbon Footprint
        <div className="title-underline"></div>
      </h1>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <DonationCard />
        </Col>
      </Row>
    </Container>
  );
};

export default DonationPage;