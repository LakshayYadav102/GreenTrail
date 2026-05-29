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
  
  // 🟢 GreenCoin Wallet Balance (Used for Internal Carbon Trading)
  greenCoins: { type: Number, default: 0 }, 
  
  mobile: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  
  // 🏢 B2B / Enterprise ESG Fields
  role: { type: String, enum: ["user", "admin", "corporate"], default: "user" },
  companyName: { type: String, default: "" }, 
  department: { 
    type: String, 
    enum: ["Engineering", "Sales", "HR & Admin", "Marketing", "Operations", "Finance", "General"], 
    default: "General" 
  },

// 🛡️ Enterprise Trust & Verification Engine

// Employee-entered commute distance
distanceToOffice: {
  type: Number,
  default: 0
},

// Auditor-approved verified commute distance
verifiedDistanceToOffice: {
  type: Number,
  default: 0
},

// Current home address
homeAddress: {
  type: String,
  default: ""
},

// Company office location
officeAddress: {
  type: String,
  default: ""
},

// Address proof upload (Aadhar / Bill / Rental Agreement etc.)
addressProof: {
  type: String,
  default: ""
},

// Monthly electricity proof
electricityBillProof: {
  type: String,
  default: ""
},

// Monthly LPG proof
lpgBillProof: {
  type: String,
  default: ""
},

// Auditor verification state
commuteVerificationStatus: {
  type: String,
  enum: ["pending", "verified", "rejected"],
  default: "pending"
},

// Credibility engine
credibilityScore: {
  type: Number,
  default: 2.5,
  min: 0,
  max: 5
},

// Tracks total awarded ICTs after verification multiplier
totalICTsAwarded: {
  type: Number,
  default: 0
},

// Whether employee is currently trusted
isVerifiedByAuditor: {
  type: Boolean,
  default: false
},

// Last auditor review date
lastAuditDate: {
  type: Date,
  default: null
},

  donations: [donationSchema], // 🌱 Track donation history

  

  // Added social graph fields (followers & following)
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, {
  timestamps: true   
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);