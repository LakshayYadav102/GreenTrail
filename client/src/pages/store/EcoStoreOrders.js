import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GreenverseNavbar from "../../components/GreenverseNavbar";
import "./EcoStoreOrders.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function EcoStoreOrders() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/store/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, navigate]);

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/800x600.png?text=Image+Unavailable";
  };

  return (
    <>
      <GreenverseNavbar />
      <div className="es-orders-page">
        <div className="es-orders-container">
          <div className="es-orders-header">
            <button className="es-back-btn" onClick={() => navigate("/store")}>← Back to Store</button>
            <h1>My Order History</h1>
          </div>

          {loading ? (
            <div className="es-orders-loading">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="es-no-orders">
              <span className="es-empty-icon">🛒</span>
              <h3>You haven't placed any orders yet!</h3>
              <p>Head over to the EcoStore and use your GreenCoins to grab some sustainable gear.</p>
              <button className="es-shop-now-btn" onClick={() => navigate("/store")}>Shop Now</button>
            </div>
          ) : (
            <div className="es-orders-list">
              {orders.map((order) => (
                <div key={order._id} className="es-order-card">
                  <img 
                    src={order.product?.image || "https://via.placeholder.com/800x600.png?text=Image+Unavailable"} 
                    alt="Product" 
                    className="es-order-image" 
                    onError={handleImageError}
                  />
                  
                  <div className="es-order-details">
                    <h3>{order.product?.name || "Product Unavailable"}</h3>
                    <p className="es-order-date">
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="es-order-address"><strong>Shipped to:</strong> {order.shippingAddress}</p>
                  </div>

                  <div className="es-order-summary-box">
                    <span className={`es-order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                    <div className="es-order-math">
                      <p>Original: <span>₹{order.originalPrice}</span></p>
                      <p className="es-coins-used">Coins Used: <span>- {order.coinsUsed} 🪙</span></p>
                      <hr className="es-order-divider" />
                      <p className="es-total-paid">Total Paid: <span>₹{order.finalAmountPaid}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EcoStoreOrders;