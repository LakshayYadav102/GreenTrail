import React, { useState } from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';

const DocViewer = ({ label, url }) => {
  if (!url) return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#555', fontSize: '0.85rem' }}>Not uploaded</p>
    </div>
  );

  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('raw/upload');

  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ color: '#90caf9', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>
        {label}
      </p>
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(144,202,249,0.15)',
            border: '1px solid #90caf9',
            borderRadius: '8px',
            color: '#90caf9',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          📄 Open PDF Document
        </a>
      ) : (
        <div>
          <img
            src={url}
            alt={label}
            style={{
              width: '100%',
              maxHeight: '220px',
              objectFit: 'contain',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#111',
              marginBottom: '6px'
            }}
          />
          
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#69f0ae', fontSize: '0.78rem', textDecoration: 'none' }}
          >
            🔗 Open full size
          </a>
        </div>
      )}
    </div>
  );
};

const VerificationHub = ({ employees, handleVerifyEmployee, handleRejectEmployee }) => {
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showModal, setShowModal]     = useState(false);

  const verifiedCount = employees.filter(emp => emp.commuteVerificationStatus === 'verified').length;
  const rejectedCount = employees.filter(emp => emp.commuteVerificationStatus === 'rejected').length;
  const pendingCount  = employees.filter(emp => emp.commuteVerificationStatus === 'pending').length;

  const openDocs = (emp) => {
    setSelectedEmp(emp);
    setShowModal(true);
  };

  const hasAnyDoc = (emp) =>
    emp?.addressProof || emp?.electricityBillProof || emp?.lpgBillProof;

  return (
    <>
      <div
        className="gt-graph-wrapper p-4 rounded-4 shadow-lg"
        style={{
          background: 'rgba(15,30,20,0.7)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <h3 className="text-white fw-bold mb-2">🛡️ ESG Verification Center</h3>
        <p className="text-white-50 small mb-4">
          Review employee commute authenticity and proof documents to update their Credibility Scores.
        </p>

        <div className="d-flex gap-3 mb-4 flex-wrap">
          <Badge bg="secondary" className="p-2 fs-6">👥 Total: {employees.length}</Badge>
          <Badge bg="success"   className="p-2 fs-6">✅ Verified: {verifiedCount}</Badge>
          <Badge bg="danger"    className="p-2 fs-6">❌ Rejected: {rejectedCount}</Badge>
          <Badge bg="warning" text="dark" className="p-2 fs-6">⏳ Pending: {pendingCount}</Badge>
        </div>

        {employees.length === 0 ? (
          <p className="text-success mt-4">No employee records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr className="text-white-50">
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Claimed Distance</th>
                  <th>Credibility</th>
                  <th>Proof Docs</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td className="fw-bold">{emp.username}</td>
                    <td className="text-capitalize">{emp.department || 'General'}</td>
                    <td className="text-info fw-bold">{emp.distanceToOffice || '—'} km</td>
                    <td>
                      <Badge bg={
                        emp.credibilityScore > 3.5 ? 'success' :
                        emp.credibilityScore >= 2.0 ? 'warning' : 'danger'
                      }>
                        {emp.credibilityScore || 0} / 5
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant={hasAnyDoc(emp) ? 'outline-info' : 'outline-secondary'}
                        size="sm"
                        onClick={() => openDocs(emp)}
                        disabled={!hasAnyDoc(emp)}
                        title={hasAnyDoc(emp) ? 'View uploaded documents' : 'No documents uploaded yet'}
                      >
                        {hasAnyDoc(emp) ? '📂 View Docs' : '⚠️ No Docs'}
                      </Button>
                    </td>
                    <td>
                      <Badge bg={
                        emp.commuteVerificationStatus === 'verified' ? 'success' :
                        emp.commuteVerificationStatus === 'rejected' ? 'danger' : 'warning'
                      } text={emp.commuteVerificationStatus === 'pending' ? 'dark' : undefined}>
                        {(emp.commuteVerificationStatus || 'pending').toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {emp.commuteVerificationStatus !== 'verified' && (
                        <div className="d-flex gap-2">
                          <Button
                            variant="success" size="sm"
                            onClick={() => handleVerifyEmployee(emp._id, emp.distanceToOffice)}
                            title="Verify employee"
                          >
                            ✅
                          </Button>
                          <Button
                            variant="danger" size="sm"
                            onClick={() => handleRejectEmployee(emp._id)}
                            title="Reject employee"
                          >
                            ❌
                          </Button>
                        </div>
                      )}
                      {emp.commuteVerificationStatus === 'verified' && (
                        <Button
                          variant="outline-warning" size="sm"
                          onClick={() => handleRejectEmployee(emp._id)}
                          title="Revoke verification"
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Document Viewer Modal ── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        contentClassName="bg-dark text-white"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Modal.Title>
            📋 Documents — {selectedEmp?.username}
            <span style={{ fontSize: '0.8rem', color: '#aaa', marginLeft: '10px' }}>
              {selectedEmp?.department || 'General'} · {selectedEmp?.distanceToOffice || '?'} km commute
            </span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '28px' }}>
          {selectedEmp && (
            <>
              <div style={{
                padding: '10px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                background:
                  selectedEmp.commuteVerificationStatus === 'verified'
                    ? 'rgba(0,200,83,0.12)'
                    : selectedEmp.commuteVerificationStatus === 'pending'
                    ? 'rgba(255,179,0,0.12)'
                    : 'rgba(255,82,82,0.12)',
                border:
                  selectedEmp.commuteVerificationStatus === 'verified'
                    ? '1px solid #00c853'
                    : selectedEmp.commuteVerificationStatus === 'pending'
                    ? '1px solid #ffb300'
                    : '1px solid #ff5252',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                  Current Status: {(selectedEmp.commuteVerificationStatus || 'pending').toUpperCase()}
                </span>
                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                  ⭐ Credibility: {selectedEmp.credibilityScore || 0}/5
                </span>
              </div>

              <DocViewer label="🏠 Address Proof"    url={selectedEmp.addressProof} />
              <DocViewer label="⚡ Electricity Bill" url={selectedEmp.electricityBillProof} />
              <DocViewer label="🔥 LPG Bill"         url={selectedEmp.lpgBillProof} />
            </>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            variant="success"
            onClick={() => {
              handleVerifyEmployee(selectedEmp._id, selectedEmp.distanceToOffice);
              setShowModal(false);
            }}
            disabled={selectedEmp?.commuteVerificationStatus === 'verified'}
          >
            ✅ Verify Employee
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleRejectEmployee(selectedEmp._id);
              setShowModal(false);
            }}
          >
            ❌ Reject
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VerificationHub;