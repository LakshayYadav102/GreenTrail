const mongoose = require('mongoose');
const User = require('./models/user'); // Ensure this path points to your User model
require('dotenv').config();

const COMPANY_NAME = 'techcorp'; 

const seedDatabase = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenverse';
    
    await mongoose.connect(mongoURI);
    console.log("✅ Connected successfully.");

    console.log(`🗑️ Clearing old test data for company: ${COMPANY_NAME}...`);
    await User.deleteMany({ companyName: COMPANY_NAME });

    // 1. Generate Employees
    console.log("🌱 Generating Employees...");
    const departments = ['Engineering', 'Marketing', 'Operations', 'HR', 'Finance'];
    const usersToInsert = [];

    for (let i = 0; i < 25; i++) {
      usersToInsert.push({
        username: `techcorp_emp_${i + 1}`, // 🟢 ADDED THIS LINE to fix the validation error
        name: `Employee ${i + 1}`,
        email: `employee${i + 1}@${COMPANY_NAME}.com`,
        password: 'password123', 
        companyName: COMPANY_NAME,
        department: departments[i % departments.length], 
        totalCarbonFootprint: Math.floor(Math.random() * 8000) + 1000, 
        greenCoins: Math.floor(Math.random() * 2000) + 200, 
      });
    }

    // Save employees to the database
    const insertedUsers = await User.insertMany(usersToInsert);
    const employeeIds = insertedUsers.map(user => user._id);
    console.log(`✅ Inserted ${insertedUsers.length} employees for ${COMPANY_NAME}.`);

    const db = mongoose.connection.db;

    // 2. Generate Carpool Rides
    console.log("🚗 Generating Carpool Rides...");
    const rides = [];
    for (let i = 0; i < 150; i++) {
      rides.push({
        driver: employeeIds[Math.floor(Math.random() * employeeIds.length)],
        date: new Date(),
        distance: Math.floor(Math.random() * 30) + 5
      });
    }
    await db.collection('rides').insertMany(rides);
    console.log(`✅ Inserted ${rides.length} rides.`);

    // 3. Generate Food Donations
    console.log("🍎 Generating Food Donations...");
    const foods = [];
    for (let i = 0; i < 80; i++) {
      foods.push({
        donor: employeeIds[Math.floor(Math.random() * employeeIds.length)],
        quantity: Math.floor(Math.random() * 15) + 2,
        date: new Date()
      });
    }
    await db.collection('fooddonations').insertMany(foods);
    console.log(`✅ Inserted ${foods.length} food donations.`);

    // 4. Generate Eco Videos
    console.log("📹 Generating GreenStream Videos...");
    const videos = [];
    for (let i = 0; i < 40; i++) {
      videos.push({
        uploader: employeeIds[Math.floor(Math.random() * employeeIds.length)],
        views: Math.floor(Math.random() * 500) + 50,
        uploadDate: new Date()
      });
    }
    await db.collection('ecovideos').insertMany(videos);
    console.log(`✅ Inserted ${videos.length} training videos.`);

    console.log("🎉 SEEDING COMPLETE! Your dashboard is ready to view.");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
};

seedDatabase();