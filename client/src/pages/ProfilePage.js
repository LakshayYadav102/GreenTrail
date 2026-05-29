import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Container, Form, Button, Card, Spinner, Alert, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import "./ProfilePage.css";

// ── Circular progress ring ──────────────────────────────────────────────────
const CircleRing = ({ used, total, color, size = 120 }) => {
  const pct    = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const r      = 44;
  const circ   = 2 * Math.PI * r;
  const dash   = (pct / 100) * circ;
  const isOver = used > total;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={isOver ? "#ff5252" : color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="50" y="46" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="800">
        {used}
      </text>
      <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">
        / {total} kg
      </text>
    </svg>
  );
};

// ── Corporate Mission Control (The ESG Dashboard) ───────────────────────────
const CorporateMissionControl = ({ user }) => {
  const [dynamicData, setDynamicData] = useState({
    leaderboard:        [],
    rank:               0,
    totalInDept:        0,
    activityFeed:       [],
    healedFootprint:    0,
    netMonthly:         0,
    netQuarterly:       0,
    monthlyEmissions:   0,
    monthlyOffset:      0,
    quarterlyEmissions: 0,
    quarterlyOffset:    0,
    netLifetime:        0,
    lifetimeOffset:     0,
  });
  const [loading, setLoading] = useState(true);

  const perks = [
    { label: "Premium Parking",       cost: 500, icon: "🅿️" },
    { label: "Cafeteria Voucher ₹200", cost: 300, icon: "🍽️" },
    { label: "Work From Home Day",    cost: 800, icon: "🏠" },
    { label: "Early Friday Leave",    cost: 600, icon: "⏰" },
  ];

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const res = await api.get(`/corporate/employee-profile/${user._id}`);
        setDynamicData(res.data);
      } catch (error) {
        console.error("Failed to fetch dynamic corporate profile data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchDynamicData();
  }, [user]);

  const handleRedeemClick = () => {
    alert("🚀 Prototype Mode: ICT Perks Store redemption integration is coming in Phase 2!");
  };

  const ict              = user?.greenCoins || 0;
  const footprint        = dynamicData.healedFootprint || user?.totalCarbonFootprint || 0;
  const netMonthly       = dynamicData.netMonthly       || 0;
  const netQuarterly     = dynamicData.netQuarterly     || 0;
  const monthlyBudget    = 450;
  const quarterlyBudget  = monthlyBudget * 3;
  const isOnTrack        = netMonthly <= monthlyBudget; 

  const medal = (i) => ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;

  const reportableNet = Math.floor(dynamicData.netLifetime * 0.85);

  const brsrTooltip = (
    <Tooltip id="brsr-tooltip" style={{ fontSize: "0.85rem", textAlign: "left" }}>
      <strong>Scope 3 Attribution:</strong> Corporate BRSR compliance only requires tracking emissions attributable to business operations. We apply an 85% modifier to your <strong>Net Footprint</strong> to isolate your final corporate-liable data.
    </Tooltip>
  );

  if (loading) return (
    <div className="text-center py-4">
      <Spinner animation="border" variant="success" />
    </div>
  );

  return (
    <div className="gv-corp-wrapper">
      <div className="gv-corp-header">
        <div className="gv-corp-header-left">
          <h2 className="gv-corp-name">{user?.username}</h2>
          <span className="gv-corp-badge">
            🏢 {user?.department || "General"} — {user?.companyName?.toUpperCase() || "COMPANY"}
          </span>
          <span className={`gv-corp-status ${isOnTrack ? "on-track" : "over"}`}>
            {isOnTrack ? "🟢 On Track" : "🔴 Over Budget"}
          </span>

          {/* Added as per request */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "700",
                background:
                  user?.commuteVerificationStatus === "verified"
                    ? "rgba(0,200,83,0.12)"
                    : user?.commuteVerificationStatus === "pending"
                    ? "rgba(255,179,0,0.12)"
                    : "rgba(255,82,82,0.12)",

                color:
                  user?.commuteVerificationStatus === "verified"
                    ? "#69f0ae"
                    : user?.commuteVerificationStatus === "pending"
                    ? "#ffd54f"
                    : "#ff8a80",
              }}
            >
              {user?.commuteVerificationStatus === "verified"
                ? "✅ ESG Verified"
                : user?.commuteVerificationStatus === "pending"
                ? "🟡 ESG Pending"
                : "❌ ESG Rejected"}
            </span>

            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "700",
                background: "rgba(144,202,249,0.12)",
                color: "#90caf9"
              }}
            >
              ⭐ {user?.credibilityScore || 2.5}/5 Trust Score
            </span>
          </div>
        </div>

        <div className="gv-corp-header-right">
          <CircleRing used={netMonthly} total={monthlyBudget} color="#69f0ae" size={110} />
          <p className="gv-corp-ring-label">Monthly Net CO₂</p>
        </div>
      </div>

      <div className="gv-corp-goals">
        <div className="gv-corp-goal-card">
          <p className="gv-corp-goal-label">📅 This Month</p>
          <div className="gv-corp-goal-bar-track">
            <div
              className="gv-corp-goal-bar-fill"
              style={{
                width: `${Math.min(100, (netMonthly / monthlyBudget) * 100)}%`,
                background: isOnTrack
                  ? "linear-gradient(90deg,#00c853,#69f0ae)"
                  : "linear-gradient(90deg,#d50000,#ff5252)"
              }}
            />
          </div>
          <p className="gv-corp-goal-stat">
            <span style={{ color: isOnTrack ? "#69f0ae" : "#ff5252" }}>
              {netMonthly} kg net
            </span>
            {" "}
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8em" }}>
              ({dynamicData.monthlyEmissions} emitted − {dynamicData.monthlyOffset} offset)
            </span>
            {" "}of{" "}
            <span style={{ color: "#fff" }}>{monthlyBudget} kg budget</span>
          </p>
        </div>

        <div className="gv-corp-goal-card">
          <p className="gv-corp-goal-label">📊 This Quarter</p>
          <div className="gv-corp-goal-bar-track">
            <div
              className="gv-corp-goal-bar-fill"
              style={{
                width: `${Math.min(100, (netQuarterly / quarterlyBudget) * 100)}%`,
                background: "linear-gradient(90deg,#0288d1,#4fc3f7)"
              }}
            />
          </div>
          <p className="gv-corp-goal-stat">
            <span style={{ color: "#4fc3f7" }}>{netQuarterly} kg net</span>
            {" "}
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8em" }}>
              ({dynamicData.quarterlyEmissions} emitted − {dynamicData.quarterlyOffset} offset)
            </span>
            {" "}of{" "}
            <span style={{ color: "#fff" }}>{quarterlyBudget} kg</span>
          </p>
        </div>

        <div className="gv-corp-goal-card">
          <p className="gv-corp-goal-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 BRSR Contribution</span>
            <OverlayTrigger placement="top" overlay={brsrTooltip}>
              <span style={{ cursor: "help", color: "#90caf9", fontSize: "1.15rem", display: 'flex' }}>
                <FaInfoCircle />
              </span>
            </OverlayTrigger>
          </p>
          <p className="gv-corp-brsr-val">{reportableNet} kg</p>
          <p className="gv-corp-brsr-sub">
            Gross: {footprint} kg · Offset: {dynamicData.lifetimeOffset} kg · Net: {dynamicData.netLifetime} kg
            <br/>
            <span style={{ color: "#90caf9" }}>{reportableNet} kg (85% Attributable)</span> added to company report
          </p>
        </div>
      </div>

      <div className="gv-corp-mid">
        <div className="gv-corp-feed">
          <h4 className="gv-corp-section-title">⚡ Your Recent Impact</h4>
          {dynamicData.activityFeed.length > 0 ? (
            dynamicData.activityFeed.map((item, i) => (
              <div key={i} className="gv-corp-feed-item">
                <span className="gv-corp-feed-icon">{item.icon}</span>
                <div className="gv-corp-feed-text">
                  <p className="gv-corp-feed-label">{item.label}</p>
                  <p className="gv-corp-feed-meta">
                    {item.co2 > 0
                      ? `−${item.co2} kg CO₂e saved`
                      : "Carbon activity tracked"}
                  </p>
                </div>
                <span className="gv-corp-feed-ict">+{item.ict} ICT 🌿</span>
              </div>
            ))
          ) : (
            <p className="text-muted small mt-3">
              No verified activities yet. Start carpooling or donating food to earn ICTs!
            </p>
          )}
        </div>

        <div className="gv-corp-leaderboard">
          <h4 className="gv-corp-section-title">🏆 Top 10 Employees</h4>
          {dynamicData.leaderboard.map((entry, i) => {
            const isYou = entry._id?.toString() === user._id?.toString();
            return (
              <div key={i} className={`gv-corp-lb-row ${isYou ? "you" : ""}`}>
                <span className="gv-corp-lb-medal">{medal(i)}</span>
                <span className="gv-corp-lb-name">
                  {entry.username}
                  {isYou && <span className="gv-corp-lb-you-tag">YOU</span>}
                </span>
                <span className="gv-corp-lb-ict">{entry.greenCoins || 0} ICT</span>
              </div>
            );
          })}
          <p className="gv-corp-lb-rank">
            You rank{" "}
            <strong style={{ color: "#69f0ae" }}>#{dynamicData.rank}</strong>
            {" "}out of {dynamicData.totalInDept} in the company.
          </p>
        </div>
      </div>

      <div className="gv-corp-perks">
        <div className="gv-corp-perks-header">
          <h4 className="gv-corp-section-title" style={{ marginBottom: 0 }}>
            💳 ICT Perks Wallet
          </h4>
          <span className="gv-corp-perks-balance">{ict} ICT available</span>
        </div>
        <div className="gv-corp-perks-grid">
          {perks.map((perk, i) => {
            const canAfford = ict >= perk.cost;
            return (
              <div key={i} className={`gv-corp-perk-card ${canAfford ? "affordable" : "locked"}`}>
                <span className="gv-corp-perk-icon">{perk.icon}</span>
                <p className="gv-corp-perk-label">{perk.label}</p>
                <p className="gv-corp-perk-cost">{perk.cost} ICT</p>
                <button
                  className="gv-corp-perk-btn"
                  onClick={handleRedeemClick}
                  style={{
                    background: canAfford
                      ? "linear-gradient(135deg,#1b5e20,#2e7d32)"
                      : "rgba(255,255,255,0.08)",
                    color: canAfford ? "#fff" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {canAfford ? "Redeem" : "🔒 Locked"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── MAIN PROFILE PAGE (Settings & Proofs) ──────────────────────────────────
const ProfilePage = () => {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [successMessage, setSuccess]  = useState("");
  const [profilePic, setProfilePic]   = useState(null);
  const [uploading, setUploading]     = useState(false);

  const [documents, setDocuments] = useState({
    addressProof: null,
    electricityBillProof: null,
    lpgBillProof: null,
  });

  const [updatedUser, setUpdatedUser] = useState({
    username: "",
    mobile: "",
    dob: "",
    address: "",
    distanceToOffice: "",
    homeAddress: "",
    officeAddress: "",
  });

  const userRole    = localStorage.getItem("userRole");
  const isCorporate = userRole === "corporate";

  useEffect(() => { fetchUserProfile(); }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUser(res.data);
      setUpdatedUser({
        username: res.data.username || "",
        mobile:   res.data.mobile   || "",
        dob:      res.data.dob ? res.data.dob.split("T")[0] : "",
        address:  res.data.address  || "",
        distanceToOffice:
          res.data.distanceToOffice !== undefined
            ? res.data.distanceToOffice
            : "",
        homeAddress: res.data.homeAddress || "",
        officeAddress: res.data.officeAddress || "",
      });
      setProfilePic(res.data.profilePic);
    } catch (err) {
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });

  const handleDocumentChange = (e) => {
    setDocuments({
      ...documents,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put("/profile", updatedUser);
      setSuccess("Profile updated successfully!");
      fetchUserProfile();
    } catch {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);
    try {
      setUploading(true);
      const res = await api.post("/profile/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfilePic(res.data.profilePic);
      setSuccess("Profile picture updated!");
      window.dispatchEvent(new Event("storage"));
      fetchUserProfile();
    } catch {
      setError("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const formData = new FormData();

      if (documents.addressProof) {
        formData.append("addressProof", documents.addressProof);
      }
      if (documents.electricityBillProof) {
        formData.append("electricityBillProof", documents.electricityBillProof);
      }
      if (documents.lpgBillProof) {
        formData.append("lpgBillProof", documents.lpgBillProof);
      }

      setUploading(true);

      await api.post(
        "/profile/upload-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess("Corporate documents uploaded successfully!");
      fetchUserProfile();
    } catch (err) {
      console.error(err);
      setError("Failed to upload verification documents.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)"
    }}>
      <Spinner animation="border" style={{ color: "#2ecc71", width: "3rem", height: "3rem" }} />
    </div>
  );

  return (
    <div className="gv-profile-page-wrapper">
      <Container className="gv-profile-container">

        <div className="gv-profile-header text-center mb-4">
          <h2 className="gv-profile-title">
            {isCorporate ? "🏢 Carbon Mission Control" : "Your Profile"}
          </h2>
          {error          && <Alert variant="danger"  className="alert-pop">{error}</Alert>}
          {successMessage && <Alert variant="success" className="alert-pop">{successMessage}</Alert>}
        </div>

        {/* Corporate ESG Dashboard */}
        {isCorporate && user && <CorporateMissionControl user={user} />}

        {!isCorporate && (
          <Card className="gv-profile-card glassmorphism mb-4 text-center border-success w-100">
            <Card.Body>
              <h4 className="gv-greencoin-title">
                <span className="gv-coin-icon">🪙</span>
                {user?.greenCoins || 0} GreenCoins
              </h4>
              <p className="gv-text-muted-custom small mb-0">
                Your universal GreenVerse currency. Earn more by offsetting carbon,
                sharing rides, and rescuing food!
              </p>
            </Card.Body>
          </Card>
        )}

        {/* ── PROFILE SETTINGS FORM ── */}
        <Card className="gv-profile-card glassmorphism w-100">
          <Card.Body className="p-4 p-md-5 w-100">

            <div className="gv-avatar-section">
              <div className="gv-avatar-wrapper">
                <img
                  src={profilePic || "/default-avatar.png"}
                  alt="Profile"
                  className="gv-profile-pic"
                />
                <label className="gv-upload-overlay">
                  {uploading ? (
                    <div className="gv-upload-spinner">
                      <Spinner animation="border" variant="light" size="sm" />
                    </div>
                  ) : (
                    <>
                      <span className="gv-upload-icon">📷</span>
                      <input
                        type="file" accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="d-none"
                      />
                    </>
                  )}
                </label>
              </div>
              <p className="gv-avatar-instruction mt-3">Click image to update photo</p>
            </div>

            <Form onSubmit={handleUpdateProfile} className="w-100">
              <Row className="w-100 m-0">
                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Username</Form.Label>
                    <Form.Control
                      type="text" name="username"
                      value={updatedUser.username} onChange={handleChange}
                      className="gv-form-input" placeholder="Enter username" required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Mobile Number</Form.Label>
                    <Form.Control
                      type="text" name="mobile"
                      value={updatedUser.mobile} onChange={handleChange}
                      className="gv-form-input" placeholder="Enter mobile number"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Date of Birth</Form.Label>
                    <Form.Control
                      type="date" name="dob"
                      value={updatedUser.dob} onChange={handleChange}
                      className="gv-form-input"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Address</Form.Label>
                    <Form.Control
                      as="textarea" name="address"
                      value={updatedUser.address} onChange={handleChange}
                      className="gv-form-input" rows={1}
                      placeholder="Enter your address"
                    />
                  </Form.Group>
                </Col>

                {isCorporate && (
                  <>
                    <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                      <Form.Group className="text-start w-100">
                        <Form.Label className="gv-form-label text-info fw-bold">
                          🏠 Home Address
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="homeAddress"
                          value={updatedUser.homeAddress}
                          onChange={handleChange}
                          className="gv-form-input border-info"
                          placeholder="Enter your home address"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                      <Form.Group className="text-start w-100">
                        <Form.Label className="gv-form-label text-info fw-bold">
                          🏢 Office Address
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="officeAddress"
                          value={updatedUser.officeAddress}
                          onChange={handleChange}
                          className="gv-form-input border-info"
                          placeholder="Enter your office location"
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}

                {isCorporate && (
                  <Col xs={12} className="px-md-3 px-0 mb-3">
                    <Form.Group className="text-start w-100">
                      <Form.Label className="gv-form-label text-warning fw-bold">
                        Distance to Office (One-way in km)
                      </Form.Label>
                      <Form.Control
                        type="number" name="distanceToOffice"
                        value={updatedUser.distanceToOffice} onChange={handleChange}
                        className="gv-form-input border-warning" 
                        placeholder="e.g. 15"
                      />
                      <Form.Text className="text-white-50" style={{fontSize: '0.75rem'}}>
                        This establishes your baseline commute. Required for smart footprint tracking.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              {/* Corporate Document Upload Section */}
              {isCorporate && (
                <div className="mt-4 p-4 text-start mx-md-3 mx-0" style={{ background: 'rgba(243, 156, 18, 0.1)', border: '1px solid #f39c12', borderRadius: '15px' }}>
                  <h5 className="text-warning fw-bold mb-1">📋 Monthly Compliance Proofs</h5>
                  <p className="text-white-50 small mb-4">
                    Upload your utility bills to verify your household emissions. 
                    <strong> Required by the 1st of every month (Currently accepting May 2026).</strong>
                  </p>
                  
                  <Row>
                    <Col md={4} className="mb-3">
                      <Form.Label className="text-white small">Current Address Proof</Form.Label>
                      <Form.Control 
                        type="file" 
                        size="sm" 
                        className="bg-dark text-white" 
                        accept="image/*,.pdf"
                        name="addressProof"
                        onChange={handleDocumentChange}
                      />
                      {user?.addressProof && (
                        <a
                          href={user.addressProof}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#69f0ae",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            textDecoration: "none",
                            display: "block",
                            marginTop: "8px"
                          }}
                        >
                          ✅ View uploaded document
                        </a>
                      )}
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Label className="text-white small">Electricity Bill (May)</Form.Label>
                      <Form.Control 
                        type="file" 
                        size="sm" 
                        className="bg-dark text-white" 
                        accept="image/*,.pdf"
                        name="electricityBillProof"
                        onChange={handleDocumentChange}
                      />
                      {user?.electricityBillProof && (
                        <a
                          href={user.electricityBillProof}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#69f0ae",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            textDecoration: "none",
                            display: "block",
                            marginTop: "8px"
                          }}
                        >
                          ✅ View uploaded document
                        </a>
                      )}
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Label className="text-white small">LPG Bill (May)</Form.Label>
                      <Form.Control 
                        type="file" 
                        size="sm" 
                        className="bg-dark text-white" 
                        accept="image/*,.pdf"
                        name="lpgBillProof"
                        onChange={handleDocumentChange}
                      />
                      {user?.lpgBillProof && (
                        <a
                          href={user.lpgBillProof}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#69f0ae",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            textDecoration: "none",
                            display: "block",
                            marginTop: "8px"
                          }}
                        >
                          ✅ View uploaded document
                        </a>
                      )}
                    </Col>
                  </Row>

                  <Button
                    variant="warning"
                    className="mt-3 fw-bold"
                    onClick={handleDocumentUpload}
                    disabled={uploading}
                  >
                    {uploading ? "Uploading Documents..." : "Upload Verification Documents"}
                  </Button>
                </div>
              )}

              <div className="text-center mt-4 w-100">
                <Button
                  type="submit" variant="success"
                  className="gv-save-button px-5 py-2"
                  disabled={loading}
                >
                  {loading
                    ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</>
                    : "Save Profile & Documents"}
                </Button>
              </div>
            </Form>

          </Card.Body>
        </Card>

      </Container>
    </div>
  );
};

export default ProfilePage;