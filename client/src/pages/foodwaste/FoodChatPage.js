import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api"; // Using centralized API
import "./FoodChatPage.css";

function FoodChatPage() {
  const { donationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Use a ref for the socket to avoid re-initializing
  const socketRef = useRef(null);

  const userId = localStorage.getItem("userId");

  // Start conversation
  const startConversation = async () => {
    try {
      // CLEANED FOR HOSTING: Auth header handled by api interceptor
      const res = await api.post("/food-conversations/start", { donationId });

      setConversation(res.data);

      // Join socket room
      if (socketRef.current) {
         socketRef.current.emit("joinFoodConversation", res.data._id);
      }

      setLoading(false);
    } catch (err) {
      console.error("Start Conversation Error:", err);
      alert("Failed to start chat");
      setLoading(false);
    }
  };

  // Send message via socket
  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;

    socketRef.current.emit("sendFoodMessage", {
      conversationId: conversation._id,
      senderId: userId,
      message,
    });

    setMessage("");
  };

  // Initialize Socket and listeners
  useEffect(() => {
    // Dynamically use Render URL or localhost for sockets
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on("newFoodMessage", ({ conversation }) => {
      setConversation(conversation);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newFoodMessage");
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    startConversation();
    // eslint-disable-next-line
  }, [donationId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  if (loading) return <p>Loading chat...</p>;

  return (
    <div className="food-chat-page">
      <h2>Food Donation Chat</h2>

      <div className="chat-box">
        {conversation.messages.length === 0 && (
          <p>No messages yet.</p>
        )}

        {conversation.messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender?._id === userId
                ? "chat-message self"
                : "chat-message"
            }
          >
            <strong>{msg.sender?.username || "User"}</strong>
            <p>{msg.message}</p>
            <small>
              {new Date(msg.timestamp).toLocaleString()}
            </small>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default FoodChatPage;