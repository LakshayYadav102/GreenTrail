const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Import all models to calculate the wallet breakdown
const Activity = require("../models/activity");
const Donation = require("../models/Donation");
const Ride = require("../models/Ride");
const Booking = require("../models/Booking");
const FoodDonation = require("../models/FoodDonation");
const EcoVideo = require("../models/EcoVideo");

const router = express.Router();

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {

    let folderName = "greenverse_profiles";

    if (file.fieldname === "addressProof") {
      folderName = "greenverse_documents/address_proofs";
    }

    if (file.fieldname === "electricityBillProof") {
      folderName = "greenverse_documents/electricity_bills";
    }

    if (file.fieldname === "lpgBillProof") {
      folderName = "greenverse_documents/lpg_bills";
    }

    if (file.fieldname === "profilePic") {
      folderName = "greenverse_profiles";
    }

    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: folderName,
      resource_type: isPdf ? "raw" : "image",
      allowed_formats: isPdf
        ? ["pdf"]
        : ["jpg", "png", "jpeg", "webp"],
    };
  },
});

const upload = multer({ storage });

const verifyToken = (req) => {

  const authHeader =
    req.headers.authorization ||
    req.header("Authorization");

  if (!authHeader) {
    throw new Error("No token, authorization denied");
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  return decoded.userId;
};

// Fetch User Profile
router.get("/", async (req, res) => {
  try {
    const userId = verifyToken(req); 
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Fetch Just the Wallet Balance for Navbar
router.get("/wallet", async (req, res) => {
  try {
    const userId = verifyToken(req);
    const user = await User.findById(userId).select("greenCoins");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ greenCoins: user.greenCoins || 0 });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Fetch Detailed Wallet Breakdown & SYNC PAST DATA
router.get("/wallet-details", async (req, res) => {
  try {
    const userId = verifyToken(req);
    
    // Fetch user with verification fields
    const user = await User.findById(userId).select(
      "greenCoins role commuteVerificationStatus credibilityScore isVerifiedByAuditor verifiedDistanceToOffice"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. GreenTrail
    const activitiesCount = await Activity.countDocuments({ userId });
    const activityCoins = activitiesCount * 1;

    const donations = await Donation.find({ user: userId });
    const treesPlanted = donations.reduce((sum, d) => sum + (d.treesSponsored || 0), 0);
    const treeCoins = treesPlanted * 4;
    const greenTrailTotal = activityCoins + treeCoins;

    // 2. Carpooling
    const ridesOffered = await Ride.countDocuments({ driver: userId });
    const rideOfferCoins = ridesOffered * 2;

    const bookings = await Booking.countDocuments({ passenger: userId, status: "confirmed" });
    const bookingCoins = bookings * 2;
    const carpoolTotal = rideOfferCoins + bookingCoins;

    // 3. Food Waste
    const foodDonations = await FoodDonation.find({ donor: userId, status: "ACCEPTED" });
    let foodCarbonSaved = 0;
    let foodCoins = 0;
    foodDonations.forEach(d => {
      foodCarbonSaved += (d.carbonSaved || 0);
      foodCoins += Math.max(1, Math.round((d.carbonSaved || 0) / 5));
    });

    // 4. EcoLearn
    const videos = await EcoVideo.find({ user: userId });
    let videoViews = 0;
    let videoCoins = 0;
    videos.forEach(v => {
      videoViews += (v.views || 0);
      videoCoins += 2 + Math.floor((v.views || 0) / 50); 
    });

    const calculatedTotal = greenTrailTotal + carpoolTotal + foodCoins + videoCoins;

    let finalCoins = user.greenCoins || 0;
    if (calculatedTotal > finalCoins) {
      await User.findByIdAndUpdate(userId, { greenCoins: calculatedTotal });
      finalCoins = calculatedTotal;
      console.log(`Retroactively synced wallet for user ${userId} to ${calculatedTotal} coins.`);
    }

    // ─────────────────────────────────────────────
    // VERIFIED ICT ENGINE
    // ─────────────────────────────────────────────
    let verificationMultiplier = 1;

    if (user.role === "corporate") {
      switch (user.commuteVerificationStatus) {
        case "verified":
          verificationMultiplier = 1;
          break;
        case "pending":
          verificationMultiplier = 0.7;
          break;
        case "rejected":
          verificationMultiplier = 0.3;
          break;
        default:
          verificationMultiplier = 0.5;
      }

      // credibility adjustment
      if (user.credibilityScore >= 4.5) {
        verificationMultiplier += 0.15;
      }
      if (user.credibilityScore <= 2) {
        verificationMultiplier -= 0.15;
      }

      verificationMultiplier = Math.max(0.2, Math.min(1.2, verificationMultiplier));
    }

    const verifiedICT = Math.floor(finalCoins * verificationMultiplier);

    res.json({
      totalCoins: finalCoins,
      verifiedICT,
      verificationMultiplier,
      breakdown: {
        greenTrail: { activitiesCount, activityCoins, treesPlanted, treeCoins, total: greenTrailTotal },
        carpool: { ridesOffered, rideOfferCoins, bookings, bookingCoins, total: carpoolTotal },
        foodWaste: { donationsCount: foodDonations.length, foodCarbonSaved: Number(foodCarbonSaved.toFixed(2)), total: foodCoins },
        ecoLearn: { videosCount: videos.length, videoViews, total: videoCoins }
      },
      verification: {
        status: user.commuteVerificationStatus,
        credibility: user.credibilityScore,
        verified: user.isVerifiedByAuditor,
        verifiedDistance: user.verifiedDistanceToOffice
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile
router.put("/", async (req, res) => {

  try {

    const userId = verifyToken(req);

    const {
      username,
      mobile,
      dob,
      address,
      distanceToOffice,
      homeAddress,
      officeAddress
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.username = username || user.username;
    user.mobile = mobile || user.mobile;
    user.dob = dob || user.dob;
    user.address = address || user.address;

    user.distanceToOffice =
      distanceToOffice !== undefined
        ? Number(distanceToOffice)
        : user.distanceToOffice;

    user.homeAddress = homeAddress || user.homeAddress;
    user.officeAddress = officeAddress || user.officeAddress;

    if (distanceToOffice || homeAddress || officeAddress) {
      user.commuteVerificationStatus = "pending";
      user.isVerifiedByAuditor = false;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Upload Profile Picture
router.post("/upload", upload.single("profilePic"), async (req, res) => {
  try {
    const userId = verifyToken(req); 
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    user.profilePic = req.file.path;
    await user.save();
    
    res.json({ message: "Profile picture updated", profilePic: user.profilePic });
  } catch (error) {
    console.error("Profile Pic Upload Error:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
});

// Upload Corporate Verification Documents
router.post(
  "/upload-documents",
  upload.fields([
    { name: "addressProof", maxCount: 1 },
    { name: "electricityBillProof", maxCount: 1 },
    { name: "lpgBillProof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {

      const userId = verifyToken(req);

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Save uploaded document URLs (simplified - Cloudinary now handles resource_type)
      if (req.files?.addressProof?.[0]) {
        user.addressProof = req.files.addressProof[0].path;
      }

      if (req.files?.electricityBillProof?.[0]) {
        user.electricityBillProof = req.files.electricityBillProof[0].path;
      }

      if (req.files?.lpgBillProof?.[0]) {
        user.lpgBillProof = req.files.lpgBillProof[0].path;
      }

      // Reset verification status on new upload
      user.commuteVerificationStatus = "pending";
      user.isVerifiedByAuditor = false;

      await user.save();

      res.json({
        message: "Documents uploaded successfully",
        user
      });

    } catch (error) {
      console.error("Corporate Document Upload Error:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  }
);

module.exports = router;