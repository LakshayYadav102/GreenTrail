import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import "./WalletPage.css";

function WalletPage() {
  const [walletData,   setWalletData]   = useState(null);
  const [monthlyStats, setMonthlyStats] = useState({
    monthlyEmissions: 0,
    monthlyOffset:    0,
    netMonthly:       0,
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const userRole    = localStorage.getItem("userRole");
  const companyName = localStorage.getItem("companyName");
  const userId      = localStorage.getItem("userId");
  const isCorporate = userRole === "corporate";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Always fetch wallet breakdown
        const walletRes = await api.get("/profile/wallet-details");
        setWalletData(walletRes.data);

        // For corporate users also fetch monthly net figures
        if (isCorporate && userId) {
          const profileRes = await api.get(`/corporate/employee-profile/${userId}`);
          setMonthlyStats({
            monthlyEmissions: profileRes.data.monthlyEmissions || 0,
            monthlyOffset:    profileRes.data.monthlyOffset    || 0,
            netMonthly:       profileRes.data.netMonthly       || 0,
          });
        }
      } catch (err) {
        setError("Failed to load wallet details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isCorporate, userId]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" style={{ color: "#2ecc71" }} />
        <p className="mt-3">
          {isCorporate
            ? "Loading your Carbon Dividend Wallet..."
            : "Loading your GreenVerse Wallet..."}
        </p>
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

  const {
    totalCoins,
    verifiedICT,
    verificationMultiplier,
    breakdown
  } = walletData;

  // ── CORPORATE WALLET ──────────────────────────────────────────────────────
  if (isCorporate) {
    const monthlyBudget      = 450;   // kg CO₂ allowance per month
    const carbonUsed         = monthlyStats.netMonthly;   // FIX: actual net monthly emissions
    const budgetUsedPercent  = Math.min(100, Math.round((carbonUsed / monthlyBudget) * 100));
    const isUnderBudget      = carbonUsed <= monthlyBudget;
    const totalICT           = totalCoins;

    return (
      <Container className="wallet-container">

        {/* ── Hero ── */}
        <div className="wallet-hero" style={{ background: "linear-gradient(135deg,#1b5e20,#2e7d32)" }}>
          <h1>🏢 Carbon Dividend Wallet</h1>
          <p style={{ color: "#a5d6a7", marginBottom: "4px", fontSize: "0.9rem" }}>
            {companyName?.toUpperCase() || "CORPORATE"} — Internal Carbon Token (ICT) Account
          </p>
          <div className="coin-display">
            <span className="coin-icon">🌿</span>
            
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <span className="coin-balance">
                {verifiedICT}
              </span>

              <span
                style={{
                  color: "#90caf9",
                  fontSize: "0.85rem",
                  marginTop: "4px"
                }}
              >
                of {totalICT} total ICT
              </span>
            </div>
          </div>

          <p style={{ color: "#c8e6c9" }}>
            Internal Carbon Tokens earned
          </p>

          <p
            style={{
              color: "#ffd54f",
              fontSize: "0.8rem",
              marginTop: "8px"
            }}
          >
            ESG Verification Multiplier: ×{verificationMultiplier?.toFixed(2)}
          </p>
        </div>

        {/* ── Monthly Budget Meter ── */}
        <div style={{
          background: "#1a1a2e", borderRadius: "16px",
          padding: "24px", margin: "24px 0",
          border: `1px solid ${isUnderBudget ? "#2e7d32" : "#b71c1c"}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ color: "#fff", fontWeight: "700" }}>📊 Monthly Carbon Budget</span>
            <span style={{ color: isUnderBudget ? "#69f0ae" : "#ff5252", fontWeight: "700" }}>
              {carbonUsed} / {monthlyBudget} kg CO₂e net used
            </span>
          </div>

          {/* breakdown sub-line */}
          <p style={{ color: "#888", fontSize: "0.78rem", marginBottom: "8px" }}>
            {monthlyStats.monthlyEmissions} kg emitted this month
            &nbsp;−&nbsp;
            {monthlyStats.monthlyOffset} kg offset by tree donations
            &nbsp;=&nbsp;
            <strong style={{ color: isUnderBudget ? "#69f0ae" : "#ff5252" }}>
              {carbonUsed} kg net
            </strong>
          </p>

          <div style={{ background: "#333", borderRadius: "8px", height: "14px", overflow: "hidden" }}>
            <div style={{
              width: `${budgetUsedPercent}%`, height: "100%",
              background: isUnderBudget
                ? "linear-gradient(90deg,#00c853,#69f0ae)"
                : "linear-gradient(90deg,#d50000,#ff5252)",
              borderRadius: "8px", transition: "width 0.6s ease"
            }} />
          </div>

          <p style={{ color: "#aaa", fontSize: "0.8rem", marginTop: "10px", marginBottom: 0 }}>
            {isUnderBudget
              ? `✅ You are ${monthlyBudget - carbonUsed} kg under budget. Surplus ICTs are tradeable on the internal floor.`
              : `⚠️ Over budget by ${carbonUsed - monthlyBudget} kg. Your department must purchase allowances from under-polluting teams.`}
          </p>
        </div>

        {/* ── ESG Verification Status ── */}
        <div style={{
          background: "#101c28",
          borderRadius: "16px",
          padding: "22px",
          marginBottom: "24px",
          border:
            userRole === "corporate"
              ? walletData?.verification?.status === "verified"
                ? "1px solid #00c853"
                : walletData?.verification?.status === "pending"
                ? "1px solid #ffb300"
                : "1px solid #ff5252"
              : "1px solid rgba(255,255,255,0.08)"
        }}>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}>

            <div>
              <h4 style={{
                color: "#fff",
                marginBottom: "6px"
              }}>
                🛡️ ESG Verification Status
              </h4>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                marginBottom: 0,
                fontSize: "0.85rem"
              }}>
                Your ICT rewards are weighted based on
                enterprise ESG authenticity verification.
              </p>
            </div>

            <div>
              <span style={{
                padding: "10px 18px",
                borderRadius: "30px",
                fontWeight: "700",
                background:
                  walletData?.verification?.status === "verified"
                    ? "rgba(0,200,83,0.15)"
                    : walletData?.verification?.status === "pending"
                    ? "rgba(255,179,0,0.15)"
                    : "rgba(255,82,82,0.15)",

                color:
                  walletData?.verification?.status === "verified"
                    ? "#69f0ae"
                    : walletData?.verification?.status === "pending"
                    ? "#ffd54f"
                    : "#ff8a80",

                border:
                  walletData?.verification?.status === "verified"
                    ? "1px solid #00c853"
                    : walletData?.verification?.status === "pending"
                    ? "1px solid #ffb300"
                    : "1px solid #ff5252",
              }}>
                {
                  walletData?.verification?.status === "verified"
                    ? "✅ Verified ESG"
                    : walletData?.verification?.status === "pending"
                    ? "🟡 Pending Verification"
                    : "❌ Rejected ESG"
                }
              </span>
            </div>
          </div>

          <div style={{
            marginTop: "18px",
            display: "flex",
            gap: "18px",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              padding: "14px 18px",
              borderRadius: "12px",
              minWidth: "180px"
            }}>
              <p style={{
                color: "#aaa",
                fontSize: "0.75rem",
                marginBottom: "4px"
              }}>
                Credibility Score
              </p>
              <h5 style={{
                color: "#fff",
                marginBottom: 0
              }}>
                ⭐ {walletData?.verification?.credibility || 2.5}/5
              </h5>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              padding: "14px 18px",
              borderRadius: "12px",
              minWidth: "180px"
            }}>
              <p style={{
                color: "#aaa",
                fontSize: "0.75rem",
                marginBottom: "4px"
              }}>
                Verified Commute
              </p>
              <h5 style={{
                color: "#fff",
                marginBottom: 0
              }}>
                📏 {walletData?.verification?.verifiedDistance || 0} km
              </h5>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              padding: "14px 18px",
              borderRadius: "12px",
              minWidth: "180px"
            }}>
              <p style={{
                color: "#aaa",
                fontSize: "0.75rem",
                marginBottom: "4px"
              }}>
                Audit Status
              </p>
              <h5 style={{
                color: "#fff",
                marginBottom: 0
              }}>
                {
                  walletData?.verification?.verified
                    ? "Approved"
                    : "Awaiting Review"
                }
              </h5>
            </div>
          </div>
        </div>

        <h3 className="breakdown-title">How You Earned Your ICTs</h3>

        <Row className="g-4">

          <Col md={6}>
            <Card className="wallet-card greentrail">
              <Card.Body>
                <div className="card-header-flex">
                  <h4>🌳 GreenTrail</h4>
                  <span className="earned-badge">+{breakdown.greenTrail.total} ICT 🌿</span>
                </div>
                <ul className="reward-list">
                  <li>
                    <span>Logged {breakdown.greenTrail.activitiesCount} footprint activities</span>
                    <span className="math-text">(1 ICT per log)</span>
                  </li>
                  <li>
                    <span>Offset {breakdown.greenTrail.treesPlanted} trees via donations</span>
                    <span className="math-text">(4 ICT per tree)</span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="wallet-card carpool">
              <Card.Body>
                <div className="card-header-flex">
                  <h4>🚗 Carpooling</h4>
                  <span className="earned-badge">+{breakdown.carpool.total} ICT 🌿</span>
                </div>
                <ul className="reward-list">
                  <li>
                    <span>Offered {breakdown.carpool.ridesOffered} verified carpool rides</span>
                    <span className="math-text">(2 ICT per ride)</span>
                  </li>
                  <li>
                    <span>Completed {breakdown.carpool.bookings} geo-verified office arrivals</span>
                    <span className="math-text">(2 ICT per booking)</span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="wallet-card foodwaste">
              <Card.Body>
                <div className="card-header-flex">
                  <h4>🍲 Food Rescue</h4>
                  <span className="earned-badge">+{breakdown.foodWaste.total} ICT 🌿</span>
                </div>
                <ul className="reward-list">
                  <li>
                    <span>Rescued {breakdown.foodWaste.donationsCount} food donations</span>
                  </li>
                  <li>
                    <span>Prevented {breakdown.foodWaste.foodCarbonSaved} kg of CO₂</span>
                    <span className="math-text">(1 ICT per 5kg CO₂)</span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="wallet-card ecolearn">
              <Card.Body>
                <div className="card-header-flex">
                  <h4>📹 GreenStream</h4>
                  <span className="earned-badge">+{breakdown.ecoLearn.total} ICT 🌿</span>
                </div>
                <ul className="reward-list">
                  <li>
                    <span>Uploaded {breakdown.ecoLearn.videosCount} sustainability videos</span>
                    <span className="math-text">(2 ICT per upload)</span>
                  </li>
                  <li>
                    <span>Generated {breakdown.ecoLearn.videoViews} total views</span>
                    <span className="math-text">(1 ICT per 50 views)</span>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>

        </Row>

        {/* ── ICT Trade Floor ── */}
        <div style={{
          background: "linear-gradient(135deg,#0d1b2a,#1b2838)",
          borderRadius: "16px", padding: "24px",
          margin: "24px 0", border: "1px solid #2e7d32",
          textAlign: "center"
        }}>
          <h4 style={{ color: "#69f0ae", marginBottom: "8px" }}>💹 Internal Carbon Trade Floor</h4>
          <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "12px" }}>
            Departments under budget can trade surplus ICTs for HR perks.
            Departments over budget must purchase allowances.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ background: "#1b5e20", borderRadius: "10px", padding: "12px 20px" }}>
              <div style={{ color: "#69f0ae", fontSize: "1.4rem", fontWeight: "800" }}>{totalICT}</div>
              <div style={{ color: "#a5d6a7", fontSize: "0.75rem" }}>Tradeable ICTs</div>
            </div>
            <div style={{ background: "#1a237e", borderRadius: "10px", padding: "12px 20px" }}>
              <div style={{ color: "#90caf9", fontSize: "1.4rem", fontWeight: "800" }}>
                ₹{totalICT * 50}
              </div>
              <div style={{ color: "#bbdefb", fontSize: "0.75rem" }}>Estimated Perk Value</div>
            </div>
            <div style={{ background: "#4a148c", borderRadius: "10px", padding: "12px 20px" }}>
              <div style={{ color: "#ce93d8", fontSize: "1.4rem", fontWeight: "800" }}>{totalICT} kg</div>
              <div style={{ color: "#e1bee7", fontSize: "0.75rem" }}>CO₂e Saved (BRSR Verified)</div>
            </div>
          </div>
        </div>

      </Container>
    );
  }

  // ── STANDARD USER WALLET ──────────────────────────────────────────────────
  return (
    <Container className="wallet-container">
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
                </li>
                <li>
                  <span>Prevented {breakdown.foodWaste.foodCarbonSaved} kg of CO₂</span>
                  <span className="math-text">(1 coin per 5kg CO₂)</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="wallet-card ecolearn">
            <Card.Body>
              <div className="card-header-flex">
                <h4>📹 GreenStream</h4>
                <span className="earned-badge">+{breakdown.ecoLearn.total} 🪙</span>
              </div>
              <ul className="reward-list">
                <li>
                  <span>Uploaded {breakdown.ecoLearn.videosCount} sustainability videos</span>
                  <span className="math-text">(2 coins per upload)</span>
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