import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { FiCpu, FiZap, FiTruck, FiPlusCircle, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import api from '../services/api';

const FacilityCalculator = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [electricity, setElectricity] = useState('');
  const [servers, setServers] = useState('');
  const [fleet, setFleet] = useState('');

  const companyName = localStorage.getItem('companyName') || 'techcorp';

  // Math constants for ESG reporting
  const KWH_TO_KG_CO2 = 0.85; // Average grid emission factor
  const LITER_TO_KG_CO2 = 2.68; // Average diesel/petrol fleet factor

  // 🟢 Fetch dynamic data on load
  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      const res = await api.get(`/corporate/facility-ledger/${companyName}`);
      setLedgerData(res.data);
    } catch (error) {
      console.error("Failed to fetch ledger data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogEmissions = async (e) => {
    e.preventDefault();
    if (!electricity || !servers || !fleet) {
      alert("Please fill in all fields to maintain an accurate BRSR ledger.");
      return;
    }

    setIsSubmitting(true);

    // Calculate exact footprint
    const elecCarbon = Number(electricity) * KWH_TO_KG_CO2;
    const serverCarbon = Number(servers) * KWH_TO_KG_CO2;
    const fleetCarbon = Number(fleet) * LITER_TO_KG_CO2;
    
    // Total in metric tons (divide by 1000)
    const totalTons = ((elecCarbon + serverCarbon + fleetCarbon) / 1000).toFixed(1);

    const payload = {
      month: selectedMonth,
      electricity: Number(electricity),
      servers: Number(servers),
      fleet: Number(fleet),
      totalTons: Number(totalTons),
    };

    try {
      // 🟢 Save dynamically to database
      await api.post(`/corporate/facility-ledger/${companyName}`, payload);
      
      // Refresh the table with live data
      await fetchLedgerData();
      
      // Reset form
      setElectricity('');
      setServers('');
      setFleet('');
      
      // Advance to the next month for UX convenience
      const nextMonths = { "May 2026": "June 2026", "June 2026": "July 2026", "July 2026": "August 2026" };
      setSelectedMonth(nextMonths[selectedMonth] || 'May 2026');

    } catch (error) {
      alert(error.response?.data?.message || "Failed to save entry. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalYTDTons = ledgerData.reduce((sum, item) => sum + item.totalTons, 0).toFixed(1);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="text-white mt-3">Loading Facility Ledger...</p>
      </div>
    );
  }

  return (
    <div className="gt-graph-wrapper p-4 rounded-4 shadow-lg" style={{ background: 'rgba(15,30,20,0.7)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      
      <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap">
        <div>
          <h3 className="text-warning fw-bold mb-1">🏢 Scope 1 & 2 Facility Ledger</h3>
          <p className="text-white-50 small mb-0">
            Calculate and log monthly emissions for corporate-owned assets (HQ Electricity, Cloud Servers, Company Fleet).
          </p>
        </div>
        <Badge bg="warning" text="dark" className="p-2 fs-6 mt-2">FY 2025-26</Badge>
      </div>
      
      <Row className="g-4">
        {/* ── LEFT COLUMN: INPUT FORM ── */}
        <Col md={12} lg={4}>
          <div className="p-3 rounded-4" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 className="text-white mb-3 border-bottom border-secondary pb-2">Log New Month</h5>
            <Form onSubmit={handleLogEmissions}>
              <Form.Group className="mb-3">
                <Form.Label className="text-white-50 small">Reporting Month</Form.Label>
                <Form.Select 
                  className="bg-dark text-white border-secondary" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option>January 2026</option>
                  <option>February 2026</option>
                  <option>March 2026</option>
                  <option>April 2026</option>
                  <option>May 2026</option>
                  <option>June 2026</option>
                  <option>July 2026</option>
                  <option>August 2026</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-white small fw-bold"><FiZap className="me-1 text-warning"/> HQ Electricity (kWh)</Form.Label>
                <Form.Control 
                  type="number" className="bg-dark text-white border-secondary" placeholder="e.g. 45000"
                  value={electricity} onChange={(e) => setElectricity(e.target.value)} required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-white small fw-bold"><FiCpu className="me-1 text-info"/> Cloud Servers (kWh)</Form.Label>
                <Form.Control 
                  type="number" className="bg-dark text-white border-secondary" placeholder="AWS/Azure usage"
                  value={servers} onChange={(e) => setServers(e.target.value)} required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-white small fw-bold"><FiTruck className="me-1 text-danger"/> Fleet Fuel (Liters)</Form.Label>
                <Form.Control 
                  type="number" className="bg-dark text-white border-secondary" placeholder="e.g. 800"
                  value={fleet} onChange={(e) => setFleet(e.target.value)} required
                />
              </Form.Group>

              <Button type="submit" variant="warning" className="w-100 fw-bold rounded-pill" disabled={isSubmitting}>
                {isSubmitting ? <><Spinner size="sm" className="me-2"/>Saving...</> : <><FiPlusCircle className="me-2"/> Save to Database</>}
              </Button>
            </Form>
          </div>
        </Col>

        {/* ── RIGHT COLUMN: HISTORY TABLE ── */}
        <Col md={12} lg={8}>
          <div className="p-3 rounded-4 h-100" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 className="text-white mb-3 border-bottom border-secondary pb-2">Historical YTD Ledger</h5>
            <div className="table-responsive" style={{ maxHeight: '350px' }}>
              <Table variant="dark" hover className="align-middle text-center" style={{ backgroundColor: 'transparent' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#0a140d', zIndex: 1 }}>
                  <tr className="text-white-50 small text-uppercase">
                    <th className="text-start">Month</th>
                    <th>HQ Power</th>
                    <th>Cloud Compute</th>
                    <th>Fleet Fuel</th>
                    <th className="text-warning">Total CO₂e</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.length === 0 ? (
                    <tr><td colSpan="5" className="text-muted py-4">No data logged yet. Add your first entry!</td></tr>
                  ) : (
                    ledgerData.map((data) => (
                      <tr key={data._id}>
                        <td className="text-start fw-bold text-white">{data.month}</td>
                        <td>{data.electricity.toLocaleString()} <small className="text-white-50">kWh</small></td>
                        <td>{data.servers.toLocaleString()} <small className="text-white-50">kWh</small></td>
                        <td>{data.fleet.toLocaleString()} <small className="text-white-50">L</small></td>
                        <td className="fw-bold text-warning fs-6">{data.totalTons} <small>Tons</small></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            <div className="text-end mt-3 border-top border-secondary pt-3">
              <span className="text-white-50 me-3">Accumulated YTD Scope 1 & 2:</span>
              <strong className="text-white fs-4">{totalYTDTons} Tons</strong>
            </div>
          </div>
        </Col>
      </Row>

      {/* ── BOTTOM ROW: GREENBUILDER (FUTURE SCOPE) ── */}
      <div className="mt-4 p-4 rounded-4 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b5e20, #0a190f)', border: '1px solid #2ecc71' }}>
        <FiGlobe className="position-absolute" style={{ fontSize: '15rem', color: 'rgba(255,255,255,0.03)', top: '-20px', right: '-20px' }} />
        
        <Row className="align-items-center position-relative z-index-2">
          <Col md={8}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Badge bg="success" className="px-2 py-1">PHASE 2 DEPLOYMENT</Badge>
              <h4 className="text-white fw-bold mb-0 ms-2">Project GreenBuilder™</h4>
            </div>
            <p className="text-white-50 mb-1" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              We don't just calculate corporate footprints; we eradicate them. At the end of the Financial Year, the total Accumulated Ledger (currently <strong>{totalYTDTons} Tons</strong>) is routed through the GreenBuilder engine.
            </p>
            <ul className="text-white-50 small mt-3" style={{ listStyleType: 'circle', paddingLeft: '20px' }}>
              <li className="mb-1"><strong className="text-white">Physical Transformation:</strong> We partner with real-estate greening agencies to convert unused office spaces into indoor oxygen hubs.</li>
              <li className="mb-1"><strong className="text-white">Certified Offsets:</strong> Automatic purchasing of VCS (Verified Carbon Standard) credits for unavoidable server emissions.</li>
              <li><strong className="text-white">BRSR Net-Zero Filing:</strong> Generates the final legal certificate proving the corporation offset 100% of its facility emissions.</li>
            </ul>
          </Col>
          <Col md={4} className="text-center mt-3 mt-md-0">
            <div className="p-3 rounded-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed #2ecc71' }}>
              <FiCheckCircle className="text-success mb-2" size={40} />
              <h5 className="text-white mb-1">Target End-of-Year Net</h5>
              <h2 className="text-success fw-bold mb-0">0.0 Tons</h2>
              <small className="text-white-50">Fully Offset</small>
            </div>
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default FacilityCalculator;