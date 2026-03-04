import React, { useState, useEffect, useRef } from "react";
import io from 'socket.io-client';

function Chat({ rideId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");
  
  // Use a ref for the socket to avoid re-initializing on every render
  const socketRef = useRef(null);

  useEffect(() => {
    // Dynamically use Render URL or localhost
    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Initialize connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ['websocket', 'polling'] // Better compatibility for cloud hosting
    });

    console.log(`Chat component mounted for ride ${rideId}`);
    setMessages(initialMessages || []);

    socketRef.current.emit('joinRide', rideId);

    socketRef.current.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error(`Socket connection error:`, err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRide', rideId); // Good practice to leave room
        socketRef.current.off('newMessage');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
      }
    };
  }, [rideId, initialMessages]);

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    
    socketRef.current.emit('sendMessage', { 
      rideId, 
      message, 
      senderId: userId 
    });
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
              <span className="font-bold">
                {msg.sender._id === userId ? 'You' : (msg.sender.name || 'User')}: 
              </span>
              {msg.message}
            </p>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          className="w-full p-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;