const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');  
const calculateRoutes = require('./routes/calculateRoutes');  
const activityRoutes = require('./routes/activityRoutes');
const challengeRoutes = require('./routes/challengeRoutes'); // ✅ Added challenge routes
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// Load environment variables
dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);  // Debugging env file

// ✅ Enable CORS (Allow requests from frontend)
app.use(cors({ 
  origin: "http://localhost:3000", // Allow only frontend requests
  credentials: true, // Allow cookies and auth headers
}));

// Middleware
app.use(express.json());

// Profile Routes
app.use("/api/profile", profileRoutes);

app.use("/uploads", express.static("uploads"));


// Authentication Routes
if (authRoutes) {
  app.use('/api/auth', authRoutes);
} else {
  console.error("authRoutes is not correctly imported.");
}

// Carbon Footprint Routes
if (calculateRoutes) {
  app.use('/api', calculateRoutes);
} else {
  console.error("calculateRoutes is not correctly imported.");
}

// Activity Routes
if (activityRoutes) {
  app.use('/api/activities', activityRoutes);
} else {
  console.error("activityRoutes is not correctly imported.");
}

// ✅ Register Challenge Routes
if (challengeRoutes) {
  app.use('/api/challenges', challengeRoutes);
} else {
  console.error("challengeRoutes is not correctly imported.");
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
