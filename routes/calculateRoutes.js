const express = require('express');
const Activity = require('../models/activity');
const User = require('../models/user');
const router = express.Router();

// POST route to save activity data
router.post('/save', async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      transportData,
      houseData,
      lifestyleData,
      userId,
      totalEmission,
      carbonFootprint
    } = req.body;

    // 1. SAFELY extract the footprint amount.
    // The frontend might send it as 'totalEmission' or 'carbonFootprint'
    let finalFootprint =
      Number(totalEmission) || Number(carbonFootprint);

    // 2. If frontend didn't send a valid total, calculate manually
    if (!finalFootprint) {
      const transport = transportData?.distance
        ? Number(transportData.distance) * 0.25
        : 45;

      const house = houseData?.energyUsage
        ? Number(houseData.energyUsage) * 0.1
        : 60;

      finalFootprint = transport + house;
    }

    // 3. Final failsafe
    finalFootprint =
      Number(finalFootprint.toFixed(2)) || 120.50;

    // Create new activity
    const activity = new Activity({
      userId,
      fromDate,
      toDate,
      transportData,
      houseData,
      lifestyleData,
      totalEmission: finalFootprint,
      carbonFootprint: finalFootprint
    });

    await activity.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalCarbonFootprint: finalFootprint,
        greenCoins: 1
      }
    });

    res.status(201).json({
      message: 'Data saved successfully',
      activity
    });

  } catch (err) {
    console.error('Calculator Error:', err);
    res.status(500).json({
      message: 'Error saving data'
    });
  }
});

// GET route to retrieve all activity data for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const activities = await Activity.find({
      userId: req.params.userId
    });

    res.status(200).json({ activities });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error retrieving activities'
    });
  }
});


// GET route to predict emission from latest activity
router.get('/predict-latest/:userId', async (req, res) => {
  const axios = require('axios');
  try {
    const latestActivity = await Activity.findOne({
      userId: req.params.userId
    }).sort({ fromDate: -1 });

    if (!latestActivity) {
      return res.status(404).json({ error: 'No activity found for this user' });
    }

    const payload = {
      transportation: latestActivity.transportation || 0,
      energy:         latestActivity.energy         || 0,
      dietType:       latestActivity.diet === 'vegetarian' ? 0 : 1
    };

    const response = await axios.post(
      'http://localhost:5000/api/prediction/predict', 
      payload
    );

    res.status(200).json({ 
      prediction: response.data.predicted_total_emission 
    });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

module.exports = router;