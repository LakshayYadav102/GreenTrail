const mongoose = require('mongoose');
require('dotenv').config();

const wipeData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenverse';
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to database.");

    const COMPANY_NAME = 'techcorp'; // Or whatever you used

    // Find the dummy users to delete their related activities
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ companyName: COMPANY_NAME }).toArray();
    const userIds = users.map(u => u._id);

    if (userIds.length > 0) {
      console.log(`🗑️ Deleting ${userIds.length} dummy users and their activities...`);
      await db.collection('rides').deleteMany({ driver: { $in: userIds } });
      await db.collection('fooddonations').deleteMany({ donor: { $in: userIds } });
      await db.collection('ecovideos').deleteMany({ uploader: { $in: userIds } });
      await db.collection('users').deleteMany({ companyName: COMPANY_NAME });
    }

    console.log("✨ Database is perfectly clean and ready for real manual users.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

wipeData();