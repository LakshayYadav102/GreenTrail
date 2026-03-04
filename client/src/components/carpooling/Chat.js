// components/carpooling/Chat.jsx
import React, { useState, useEffect } from "react";
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem("token") }
});

function Chat({ rideId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    console.log(`Chat component mounted for ride ${rideId}, initial messages:`, initialMessages);
    setMessages(initialMessages || []);

    socket.emit('joinRide', rideId);
    console.log(`Emitted joinRide for ride ${rideId}`);

    socket.on('newMessage', (msg) => {
      console.log(`Received new message for ride ${rideId}:`, msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('connect_error', (err) => {
      console.error(`Socket connection error for ride ${rideId}:`, err.message);
    });

    return () => {
      console.log(`Cleaning up socket listeners for ride ${rideId}`);
      socket.off('newMessage');
      socket.off('connect_error');
    };
  }, [rideId, initialMessages]);

  const sendMessage = () => {
    if (!message.trim()) {
      console.log("Empty message not sent");
      return;
    }
    console.log(`Sending message for ride ${rideId}: ${message}`);
    socket.emit('sendMessage', { rideId, message, senderId: userId });
    setMessage("");
  };

  return (
    <div className="chat-container">
      <h3 className="text-lg font-semibold mb-2">Ride Chat</h3>
      <div className="messages overflow-y-auto h-40 border p-2 mb-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg, i) => (
            <p key={i} className={`text-sm ${msg.sender._id === userId ? 'text-right' : 'text-left'}`}>
              <span className="font-bold">{msg.sender._id === userId ? 'You' : msg.sender.name}: </span>{msg.message}
            </p>
          ))
        )}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        className="w-full p-2 border rounded-lg mb-2"
      />
      <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
        Send
      </button>
    </div>
  );
}

export default Chat;