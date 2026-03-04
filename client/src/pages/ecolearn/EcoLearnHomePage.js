// import React from "react";
// import { useNavigate } from "react-router-dom";
// import GreenverseNavbar from "../../components/GreenverseNavbar";
// import "./EcoLearnHomePage.css";

// function EcoLearnHomePage() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   const handleEnterClick = () => {
//     if (!token) {
//       navigate("/login");
//     } else {
//       navigate("/ecolearn/feed");   // ← consistent with prefix
//     }
//   };

//   return (
//     <>
//       <GreenverseNavbar />

//       <div className="ecolearn-homepage">
//         {/* HERO SECTION */}
//         <section className="ecolearn-hero">
//           <div className="hero-content">
//             <h1 className="ecolearn-title">EcoLearn 🌱</h1>

//             <p className="ecolearn-subtitle">
//               Watch. Learn. Act.<br />
//               Discover short videos that create real environmental impact.
//             </p>

//             <button className="enter-btn" onClick={handleEnterClick}>
//               {token ? "Enter EcoLearn" : "Login to Continue"}
//             </button>
//           </div>
//         </section>

//         {/* FEATURES SECTION */}
//         <section className="ecolearn-features">
//           <div className="feature-card">
//             <div className="feature-icon">🎥</div>
//             <h3>Short Eco Videos</h3>
//             <p>Quick sustainability tips in under 60 seconds.</p>
//           </div>

//           <div className="feature-card">
//             <div className="feature-icon">🌍</div>
//             <h3>Real Impact</h3>
//             <p>Track how content turns into real environmental action.</p>
//           </div>

//           <div className="feature-card">
//             <div className="feature-icon">🏆</div>
//             <h3>Earn EcoPoints</h3>
//             <p>Engage, create, and climb the sustainability leaderboard.</p>
//           </div>
//         </section>
//       </div>
//     </>
//   );
// }

// export default EcoLearnHomePage;