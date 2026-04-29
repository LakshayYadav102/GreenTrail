require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const calculateRoutes = require('./routes/calculateRoutes');
const activityRoutes = require('./routes/activityRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const blogRoutes = require('./routes/blogRoutes');
const predictionRoute = require('./routes/predictionRoute');
const donationRoutes = require('./routes/donationRoutes.');
const rideRoutes = require('./routes/rideRoutes');
const evRoutes = require('./routes/evRoutes');
const http = require('http');
const socketIo = require('socket.io');
const Ride = require("./models/Ride");
const User = require("./models/user");
const Booking = require("./models/Booking");
const foodDonationRoutes = require("./routes/foodDonationRoutes");
const FoodDonation = require("./models/FoodDonation");
const foodConversationRoutes = require("./routes/foodConversationRoutes");
const ecolearnRoutes = require("./routes/ecolearnRoutes");
const storeRoutes = require("./routes/storeRoutes");
const corporateRoutes = require('./routes/corporateRoutes');

const app = express();
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000', 
      'https://greenverse1.netlify.app', 
      'https://green-trail-27d683.netlify.app'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

console.log("[ENV LOAD CHECK] MONGO_URI:", process.env.MONGO_URI ? "present" : "MISSING");
console.log("[ENV LOAD CHECK] JWT_SECRET:", process.env.JWT_SECRET ? "present" : "MISSING");
console.log("[ENV LOAD CHECK] CLOUDINARY_URL:", process.env.CLOUDINARY_URL || "MISSING");

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://greenverse1.netlify.app', 
    'https://green-trail-27d683.netlify.app'
  ],
  credentials: true,
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} Headers: ${JSON.stringify(req.headers)}`);
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] Response sent: ${req.method} ${req.url} - Status ${res.statusCode}`);
  });
  next();
});

app.use('/uploads', express.static('uploads'));

app.use('/api/ev', evRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', calculateRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api', predictionRoute);
app.use('/api/donations', donationRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/riderequests', rideRoutes);
app.use("/api/food-donations", foodDonationRoutes);
app.use("/api/food-conversations", foodConversationRoutes);
app.use("/api/ecolearn", ecolearnRoutes);
app.use("/api/store", storeRoutes);
app.use('/api/corporate', corporateRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running correctly' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const expireFoodDonations = async () => {
  try {
    const now = new Date();

    const expiredDonations = await FoodDonation.find({
      status: "AVAILABLE",
      expiryTime: { $lt: now },
    });

    for (const donation of expiredDonations) {
      donation.status = "EXPIRED";

      if (donation.foodCategory === "raw") {
        donation.expiredHandling = "COMPOST";
      } else {
        donation.expiredHandling = "ANIMAL_FEED";
      }

      await donation.save();
    }

    if (expiredDonations.length > 0) {
      console.log(
        `[Food Expiry Job] ${expiredDonations.length} donation(s) expired`
      );
    }
  } catch (error) {
    console.error("[Food Expiry Job Error]", error);
  }
};

setInterval(() => {
  expireFoodDonations();
}, 10 * 60 * 1000);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRide', (rideId) => {
    socket.join(rideId);
    console.log(`User ${socket.id} joined ride ${rideId}`);
  });

  socket.on('sendMessage', async ({ rideId, message, senderId }) => {
    try {
      console.log(`Received message for ride ${rideId} from user ${senderId}: ${message}`);
      const ride = await Ride.findById(rideId);
      if (!ride) {
        console.error(`Ride ${rideId} not found`);
        return;
      }

      const isDriver = ride.driver.toString() === senderId;
      const isPassenger = ride.passengers.some(p => p.toString() === senderId);
      const hasBooking = await Booking.exists({ ride: rideId, passenger: senderId });
      if (!isDriver && !isPassenger && !hasBooking) {
        console.error(`User ${senderId} is not authorized to send messages for ride ${rideId}`);
        return;
      }

      const newMsg = { sender: senderId, message, timestamp: new Date() };
      ride.messages.push(newMsg);
      await ride.save();
      console.log(`Message saved for ride ${rideId}:`, newMsg);

      const sender = await User.findById(senderId, "username");
      console.log(`Broadcasting message to ride ${rideId} room`);
      io.to(rideId).emit('newMessage', {
        sender: { _id: senderId, name: sender.username },
        message,
        timestamp: new Date()
      });
    } catch (err) {
      console.error(`Error processing message for ride ${rideId}:`, err.message, err.stack);
    }
  });

  socket.on("joinFoodConversation", (conversationId) => {
    const room = `food_${conversationId}`;
    socket.join(room);
    console.log(`User ${socket.id} joined food conversation ${conversationId} (room: ${room})`);
  });

  socket.on("sendFoodMessage", async ({ conversationId, senderId, message }) => {
    try {
      const FoodConversation = require("./models/FoodConversation");

      const conversation = await FoodConversation.findById(conversationId);

      if (!conversation) {
        console.error(`Conversation ${conversationId} not found`);
        return;
      }

      if (
        conversation.donor.toString() !== senderId &&
        conversation.receiver.toString() !== senderId
      ) {
        console.error(`User ${senderId} not authorized for conversation ${conversationId}`);
        return;
      }

      const newMessage = {
        sender: senderId,
        message,
        timestamp: new Date(),
      };

      conversation.messages.push(newMessage);
      await conversation.save();

      const populatedConversation = await FoodConversation.findById(conversationId)
        .populate("messages.sender", "username");

      io.to(`food_${conversationId}`).emit("newFoodMessage", {
        conversation: populatedConversation,
      });

      console.log(`Food message sent in conversation ${conversationId}`);
    } catch (err) {
      console.error("Food Socket Error:", err.message, err.stack);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Mounted routes: /api/ev, /api/auth, /api, /api/activities, /api/challenges, /api/profile, /api/blogs, /api, /api/donations, /api/rides, /api/test, /api/food-donations, /api/food-conversations');
});