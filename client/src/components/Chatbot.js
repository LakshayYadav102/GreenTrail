import React, { useState } from "react";
import "./Chatbot.css"; // We will move the styles to a CSS file for cleaner code and animations

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="gv-chatbot-container">
      {/* The Chat Window (with animation classes) */}
      <div className={`gv-chatbot-window ${isOpen ? "open" : "closed"}`}>
        <iframe
          src="https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/02/20/06/20250220065741-AW5P96E6.json"
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="GreenVerse Assistant"
          allow="microphone"
        ></iframe>
      </div>

      {/* The Floating Action Button */}
      <button 
        className={`gv-chatbot-toggle-btn ${isOpen ? "active" : ""}`} 
        onClick={toggleChatbot}
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          // Professional Close (X) Icon
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="gv-chatbot-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Professional Chat Icon
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="gv-chatbot-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Chatbot;