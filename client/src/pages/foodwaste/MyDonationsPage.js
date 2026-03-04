import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GreenverseNavbar from "../../components/foodwaste/FoodWasteNavbar";
import api from "../../services/api"; // Centralized API
import "./MyDonationsPage.css";

function MyDonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const calculateCarbon = (quantity, unit) => {
    let kg = quantity;
    if (unit === "grams") kg /= 1000;
    if (unit === "plates") kg *= 0.4;
    return Number((kg * 2.5).toFixed(2));
  };

  const fetchMyDonations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      // CLEANED FOR HOSTING: Removed manual headers
      const res = await api.get("/food-donations/my");

      // Apply fallback for display
      const fixedDonations = (res.data.donations || []).map(d => ({
        ...d,
        displayCarbon: d.carbonSaved && d.carbonSaved > 0 
          ? d.carbonSaved 
          : calculateCarbon(d.quantity, d.unit)
      }));

      setDonations(fixedDonations);
      setSummary(res.data.summary);
    } catch (error) {
      console.error(error);
      alert("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const getStatusClass = (status) => {
    if (status === "AVAILABLE") return "status available";
    if (status === "ACCEPTED") return "status accepted";
    if (status === "EXPIRED") return "status expired";
    return "status";
  };

  return (
    <>
      <GreenverseNavbar />
      <div className="my-donations-page">
        <h1>My Donations</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {summary && (
              <div className="summary-card">
                <h2>Impact Summary</h2>
                <p>Total Donations: <strong>{summary.totalDonations}</strong></p>
                <p>Total Food Donated: <strong>{summary.totalFoodDonatedKg} kg</strong></p>
                <p>Carbon Saved: <strong>{summary.totalCarbonSaved} kg CO₂</strong></p>
              </div>
            )}

            <div className="donation-list">
              {donations.length === 0 ? (
                <p>No donations yet.</p>
              ) : (
                donations.map((donation) => (
                  <div key={donation._id} className="donation-card">
                    <div className="donation-header">
                      <span>{donation.foodCategory.toUpperCase()}</span>
                      <span className={getStatusClass(donation.status)}>
                        {donation.status}
                      </span>
                    </div>

                    <p><strong>{donation.quantity} {donation.unit}</strong> | {donation.foodType}</p>
                    <p>Expires: {new Date(donation.expiryTime).toLocaleString()}</p>
                    <p>Carbon Saved: <strong>{donation.displayCarbon} kg CO₂</strong></p>

                    {donation.status === "EXPIRED" && donation.expiredHandling && (
                      <p>Redirected To: {donation.expiredHandling}</p>
                    )}

                    {donation.status === "ACCEPTED" && donation.acceptedBy && (
                      <button
                        className="message-btn"
                        onClick={() => navigate(`/food-waste/chat/${donation._id}`)}
                      >
                        Message Receiver
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default MyDonationsPage;