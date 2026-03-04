import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import "./FoodChatPage.css";

const socket = io("http://localhost:5000"); // change if deployed

function FoodChatPage() {
  const { donationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Start conversation
  const startConversation = async () => {
    try {
      const res = await api.post(
        "/food-conversations/start",
        { donationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConversation(res.data);

      // Join socket room
      socket.emit("joinFoodConversation", res.data._id);

      setLoading(false);
    } catch (err) {
      console.error("Start Conversation Error:", err);
      alert("Failed to start chat");
      setLoading(false);
    }
  };

  // Send message via socket
  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendFoodMessage", {
      conversationId: conversation._id,
      senderId: userId,
      message,
    });

    setMessage("");
  };

  // Listen for new messages
  useEffect(() => {
    socket.on("newFoodMessage", ({ conversation }) => {
      setConversation(conversation);
    });

    return () => {
      socket.off("newFoodMessage");
    };
  }, []);

  useEffect(() => {
    startConversation();
  }, []);

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
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default FoodChatPage;