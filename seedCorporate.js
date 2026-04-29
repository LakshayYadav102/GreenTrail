const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('./models/user');

router.get('/stats/:companyName', async (req, res) => {
  try {
    const company = req.params.companyName.toLowerCase();
    const employees = await User.find({ companyName: company });
    
    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    const employeeIds = employees.map(emp => emp._id);

    // 1. Core Stats
    let totalCO2 = 0;
    let totalGreenCoins = 0;
    employees.forEach(emp => {
      totalCO2 += emp.totalCarbonFootprint;
      totalGreenCoins += emp.greenCoins;
    });

    const db = mongoose.connection.db;

    // 2. Fetch Module Data (Using native MongoDB driver for safety against schema mismatches)
    const rides = await db.collection('rides').find({ driver: { $in: employeeIds } }).toArray();
    const foods = await db.collection('fooddonations').find({ donor: { $in: employeeIds } }).toArray();
    const videos = await db.collection('ecovideos').find({ uploader: { $in: employeeIds } }).toArray();

    // 3. Dynamic Chart Data (Simulating a 5-month growth curve based on total data)
    const impactTrendData = [
      { month: 'Jan', rides: Math.floor(rides.length * 0.2), food: Math.floor(foods.length * 0.2), trees: 5 },
      { month: 'Feb', rides: Math.floor(rides.length * 0.4), food: Math.floor(foods.length * 0.4), trees: 10 },
      { month: 'Mar', rides: Math.floor(rides.length * 0.6), food: Math.floor(foods.length * 0.5), trees: 15 },
      { month: 'Apr', rides: Math.floor(rides.length * 0.8), food: Math.floor(foods.length * 0.8), trees: 20 },
      { month: 'May', rides: rides.length, food: foods.length, trees: Math.floor(totalGreenCoins / 500) },
    ];

    res.json({
      activeEmployees: employees.length,
      greenTrail: { 
        totalCO2: totalCO2, 
        totalTrees: Math.floor(totalGreenCoins / 500) 
      },
      carpooling: { 
        totalRides: rides.length, 
        co2Saved: rides.length * 15 // avg 15kg saved per ride
      }, 
      foodWaste: { 
        totalDonations: foods.length, 
        mealsSaved: foods.reduce((sum, f) => sum + (f.quantity || 5), 0) // Sum up quantities
      },
      ecoLearn: { 
        totalVideos: videos.length, 
        totalViews: videos.reduce((sum, v) => sum + (v.views || 10), 0) 
      },
      trendData: impactTrendData
    });
  } catch (error) {
    console.error("Corporate Stats Error:", error);
    res.status(500).send("Error aggregating corporate data");
  }
});

module.exports = router;