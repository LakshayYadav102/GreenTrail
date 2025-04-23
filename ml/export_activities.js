const mongoose = require('mongoose');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Activity = require('../models/activity'); // adjust path if needed

// MongoDB connection URI
const MONGO_URI = 'mongodb+srv://lakshay:lakshay22csu102@cluster0.6pbuv.mongodb.net/ecotrack?retryWrites=true&w=majority';

// Set up CSV writer
const csvWriter = createCsvWriter({
  path: 'train.csv',
  header: [
    { id: 'date', title: 'Date' },
    { id: 'transportation', title: 'Transportation' },
    { id: 'energy', title: 'Energy' },
    { id: 'dietType', title: 'DietType' },
    { id: 'totalEmission', title: 'TotalEmission' },
  ],
});

async function exportActivities() {
  try {
    const activities = await Activity.find({});
    const records = activities.map((act) => {
      // Check if 'fromDate' exists and is a valid Date
      const date = act.fromDate ? act.fromDate.toISOString().split('T')[0] : 'unknown';

      return {
        date: date,
        transportation: act.transportation || 0, // fallback for missing transportation
        energy: act.energy || 0, // fallback for missing energy
        dietType: act.diet === 'vegetarian' ? 0 : 1, // converting diet type
        totalEmission: act.totalEmission || 0, // fallback for missing total emission
      };
    });

    await csvWriter.writeRecords(records);
    console.log('✅ Data exported to train.csv');
  } catch (err) {
    console.error('❌ Error exporting data:', err);
  } finally {
    mongoose.disconnect(); // clean shutdown
  }
}

// Connect and run
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    exportActivities();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
