const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  amount: Number,          // 💰 Total amount donated
  treesPlanted: Number,    // 🌳 Number of trees user paid for
  date: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Password should be hashed
  totalCarbonFootprint: { type: Number, default: 0 }, // Lifetime carbon footprint
  mobile: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  donations: [donationSchema] // 🌱 Track donation history
});

// ✅ Prevent model re-compilation in dev
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
