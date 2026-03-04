import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GreenverseNavbar from "../../components/GreenverseNavbar";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./EcoStoreHomePage.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 🟢 INITIALIZE STRIPE 
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_51T6w4uCELMghoBHl7rvGilqN7J6AcvxP4RKdHa4eFwMrm25MB6WWj3TNHtAqIXYPyg9nYrKSHXJBq6i2jua48kRA00BSSg555p";
const stripePromise = loadStripe(stripeKey);

// ==========================================
// STRIPE CHECKOUT FORM COMPONENT
// ==========================================
const StripeCheckoutForm = ({ clientSecret, finalizeOrder, isProcessing, setIsProcessing, amountDue }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [isStripeReady, setIsStripeReady] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !isStripeReady) return;

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, 
        },
        redirect: "if_required", 
      });

      if (error) {
        setErrorMessage(error.message);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        finalizeOrder();
      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred during payment.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="es-stripe-form">
      <div className="es-payment-amount-display">
        <span>Amount Due</span>
        <h2>₹{amountDue}</h2>
      </div>
      
      <div className="es-stripe-element-container">
        <PaymentElement onReady={() => setIsStripeReady(true)} />
        {!isStripeReady && <div className="es-stripe-loading-text">Loading secure payment gateway...</div>}
      </div>

      {errorMessage && <div className="es-store-alert es-error es-mt-3">{errorMessage}</div>}

      <div className="es-payment-actions es-mt-4">
        <button 
          type="submit" 
          className="es-process-payment-btn" 
          disabled={!stripe || !isStripeReady || isProcessing}
        >
          {isProcessing ? "Processing Securely..." : `Pay ₹${amountDue} Securely`}
        </button>
      </div>
      
      {isStripeReady && (
        <p className="es-stripe-test-note">
          Use test card: <strong>4242 4242 4242 4242</strong> <br/>
          (Any future expiry date & any 3-digit CVC)
        </p>
      )}
    </form>
  );
};

// ==========================================
// MAIN STORE COMPONENT
// ==========================================
function EcoStoreHomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [shippingAddress, setShippingAddress] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      await axios.post(`${apiBaseUrl}/api/store/seed`);
      const prodRes = await axios.get(`${apiBaseUrl}/api/store/products`);
      setProducts(prodRes.data);

      if (token) {
        const coinRes = await axios.get(`${apiBaseUrl}/api/profile/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserCoins(coinRes.data.greenCoins || 0);
      }
    } catch (err) {
      console.error("Error loading store data", err);
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = (product) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setSelectedProduct(product);
    setCoinsToUse(0);
    setShippingAddress("");
    setClientSecret("");
    setMessage({ type: "", text: "" });
  };

  const closeCheckout = () => {
    if (isProcessing) return;
    setSelectedProduct(null);
    setClientSecret("");
    setMessage({ type: "", text: "" });
  };

  const handleCoinChange = (e) => {
    let val = parseInt(e.target.value) || 0;
    const maxUsable = Math.min(userCoins, selectedProduct.price);
    if (val > maxUsable) val = maxUsable;
    if (val < 0) val = 0;
    setCoinsToUse(val);
  };

  const initiatePayment = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setMessage({ type: "error", text: "Please provide a shipping address." });
      return;
    }
    
    setIsProcessing(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(`${apiBaseUrl}/api/store/create-payment-intent`, {
        productId: selectedProduct._id,
        coinsToUse: coinsToUse
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.isFree) {
        finalizeOrder();
      } else {
        setClientSecret(res.data.clientSecret);
        setIsProcessing(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to initialize payment gateway." });
      setIsProcessing(false);
    }
  };

  const finalizeOrder = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post(`${apiBaseUrl}/api/store/checkout`, {
        productId: selectedProduct._id,
        coinsToUse: coinsToUse,
        shippingAddress: shippingAddress
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: "Order placed successfully! 🌿" });
      setUserCoins(res.data.remainingCoins);
      
      setProducts(products.map(p => 
        p._id === selectedProduct._id ? { ...p, stock: p.stock - 1 } : p
      ));

      setTimeout(() => {
        closeCheckout();
      }, 2500);

    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Order finalization failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <GreenverseNavbar />
        <div className="es-eco-store-loading">
          <div className="es-eco-store-spinner"></div>
          <p>Loading EcoStore...</p>
        </div>
      </>
    );
  }

  const finalAmount = selectedProduct ? selectedProduct.price - coinsToUse : 0;

  // Fallback image function if Unsplash fails
  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/800x600.png?text=Preview+Available+Soon";
  };

  return (
    <>
      <GreenverseNavbar />
      <div className="es-eco-store-homepage">
        <div className="es-store-background">
          <div className="es-floating-icon es-icon-1">🛍️</div>
          <div className="es-floating-icon es-icon-2">🌿</div>
          <div className="es-floating-icon es-icon-3">♻️</div>
        </div>

        <div className="es-prototype-banner">
          <strong>🚀 Prototype Preview:</strong> The EcoStore uses Stripe Test Mode. Real Card Details are <strong>NOT REQUIRED</strong>.
        </div>

        {/* Hero Section */}
        <section className="es-store-hero-section">
          <div className="es-hero-content">
            <h1 className="es-store-title">EcoStore</h1>
            <p className="es-store-subtitle">Convert your sustainable choices into real-world rewards.</p>
            <div className="es-header-actions">
              {token && (
                <div className="es-store-wallet-badge">
                  <span className="es-wallet-icon">🪙</span>
                  <strong>{userCoins} GreenCoins</strong> Available
                </div>
              )}
              {token && (
                <button className="es-my-orders-btn" onClick={() => navigate("/store/orders")}>
                  📦 View My Orders
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="es-products-section">
          <h2 className="es-section-title">Upcoming Sustainable Products</h2>
          <div className="es-products-grid">
            {products.map((product) => (
              <div key={product._id} className="es-product-card">
                <div className="es-product-image-wrapper">
                  <div className="es-coming-soon-badge">Coming Soon</div>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="es-product-image" 
                    onError={handleImageError} 
                  />
                  <span className="es-product-category">{product.category}</span>
                </div>
                <div className="es-product-content">
                  <h3 className="es-product-title">{product.name}</h3>
                  <p className="es-product-description">{product.description}</p>
                  <div className="es-product-footer">
                    <p className="es-product-price">₹{product.price}</p>
                    <button 
                      className="es-product-btn" 
                      onClick={() => openCheckout(product)}
                      disabled={product.stock < 1}
                    >
                      {product.stock < 1 ? "Out of Stock" : "Test Purchase"}
                    </button>
                  </div>
                  <small className="es-stock-info">Preview Item</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🟢 CHECKOUT MODAL */}
        {selectedProduct && (
          <div className="es-store-modal-overlay" onClick={closeCheckout}>
            <div className="es-store-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="es-store-modal-close" onClick={closeCheckout}>&times;</button>
              
              {message.text && (
                <div className={`es-store-alert es-${message.type} es-mb-4`}>
                  {message.text}
                </div>
              )}

              {!clientSecret && message.type !== "success" ? (
                <>
                  <h2 className="es-modal-heading">Order Summary</h2>
                  <div className="es-modal-product-summary">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      onError={handleImageError} 
                    />
                    <div>
                      <h4>{selectedProduct.name}</h4>
                      <p>Original Price: <strong>₹{selectedProduct.price}</strong></p>
                    </div>
                  </div>

                  <div className="es-modal-coin-section">
                    <label>
                      Apply GreenCoins (1 Coin = ₹1 Discount) <br/>
                      <small>You have {userCoins} coins available.</small>
                    </label>
                    <div className="es-coin-slider-container">
                      <input 
                        type="range" 
                        min="0" 
                        max={Math.min(userCoins, selectedProduct.price)} 
                        value={coinsToUse} 
                        onChange={handleCoinChange}
                        className="es-coin-slider"
                      />
                      <input 
                        type="number" 
                        value={coinsToUse} 
                        onChange={handleCoinChange}
                        min="0"
                        max={Math.min(userCoins, selectedProduct.price)}
                        className="es-coin-number-input"
                      />
                    </div>
                  </div>

                  <div className="es-modal-price-breakdown">
                    <p>Subtotal: <span>₹{selectedProduct.price}</span></p>
                    <p className="es-discount-text">GreenCoin Discount: <span>- ₹{coinsToUse}</span></p>
                    <hr className="es-divider"/>
                    <p className="es-final-price">Total to Pay: <span>₹{finalAmount}</span></p>
                  </div>

                  <form onSubmit={initiatePayment}>
                    <div className="es-form-group">
                      <label>Shipping Address</label>
                      <textarea 
                        rows="2" 
                        placeholder="Enter delivery address..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="es-confirm-order-btn" disabled={isProcessing}>
                      {isProcessing ? "Initializing Secure Checkout..." : (finalAmount > 0 ? `Proceed to Payment (₹${finalAmount})` : "Complete Free Order")}
                    </button>
                  </form>
                </>
              ) : clientSecret && message.type !== "success" ? (
                <Elements stripe={stripePromise} options={{ 
                  clientSecret, 
                  appearance: { theme: 'stripe', variables: { colorPrimary: '#2ecc71' } } 
                }}>
                  <div className="es-payment-header">
                    <h3>🔒 Secure Checkout</h3>
                    <p>Powered by Stripe</p>
                  </div>
                  <StripeCheckoutForm 
                    clientSecret={clientSecret} 
                    finalizeOrder={finalizeOrder} 
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    amountDue={finalAmount}
                  />
                  <button className="es-cancel-payment-btn es-mt-3 es-w-100" onClick={() => setClientSecret("")} disabled={isProcessing}>
                    ← Back to Order Summary
                  </button>
                </Elements>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EcoStoreHomePage;