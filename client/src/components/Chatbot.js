import React, { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={toggleChatbot}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#008000",
          color: "#008000",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          fontSize: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {isOpen ? "✖" : "💬"}
      </button>

      {/* Chatbot iframe */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "350px",
            height: "500px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            overflow: "hidden",
            border: "1px solid #ddd",
          }}
        >
          <iframe
            src="https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/02/20/06/20250220065741-AW5P96E6.json"
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Botpress Chatbot"
            allow="microphone"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Chatbot;