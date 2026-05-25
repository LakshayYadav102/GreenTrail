const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Activity = require('../models/activity');
const Donation = require('../models/Donation');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const FoodDonation = require('../models/FoodDonation');
const EcoVideo = require('../models/EcoVideo');

router.get('/stats/:companyName', async (req, res) => {
  try {
    const company = req.params.companyName.toLowerCase();
    const employees = await User.find({ companyName: company }).lean();

    if (!employees || employees.length === 0) {
      return res.json({ activeEmployees: 0, isEmpty: true });
    }

    const employeeIds = employees.map(emp => emp._id);
    let totalGreenCoins = 0;
    const departmentStats = {};

    employees.forEach((emp) => {
      const coins = emp.greenCoins || 0;
      const dept  = emp.department || 'General';
      totalGreenCoins += coins;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { activeUsers: 0, emissionsKg: 0, offsetKg: 0 };
      }
      departmentStats[dept].activeUsers += 1;
    });

    // ── Fetch all data ──
    const activities = await Activity.find({ userId: { $in: employeeIds } }).lean();
    const donations  = await Donation.find({ user: { $in: employeeIds } }).lean();
    const rides      = await Ride.find({ driver: { $in: employeeIds } }).lean();
    const foods      = await FoodDonation.find({ donor: { $in: employeeIds } }).lean();
    const videos     = await EcoVideo.find({ user: { $in: employeeIds } }).lean();
    const bookings   = await Booking.find({ passenger: { $in: employeeIds }, status: 'confirmed' }).lean();

    // ── Build userId → department map ──
    const userDeptMap = {};
    employees.forEach(emp => {
      userDeptMap[emp._id.toString()] = emp.department || 'General';
    });

    // ── CO₂ GENERATED per department (from activity logs) ──
    let totalCO2Generated = 0;
    activities.forEach(act => {
      const emission = act.totalEmission || act.carbonFootprint || 0;
      const dept     = userDeptMap[act.userId?.toString()] || 'General';
      totalCO2Generated += emission;
      if (departmentStats[dept]) {
        departmentStats[dept].emissionsKg += emission;
      }
    });

    // ── CO₂ OFFSET per department ──
    // Trees
    let treeOffset = 0;
    donations.forEach(d => {
      const offset = (d.treesSponsored || 1) * 20;
      const dept   = userDeptMap[d.user?.toString()] || 'General';
      treeOffset += offset;
      if (departmentStats[dept]) departmentStats[dept].offsetKg += offset;
    });

    // Carpooling (rides offered + bookings taken)
    let carpoolOffset = 0;
    rides.forEach(r => {
      const offset = 15;
      const dept   = userDeptMap[r.driver?.toString()] || 'General';
      carpoolOffset += offset;
      if (departmentStats[dept]) departmentStats[dept].offsetKg += offset;
    });
    bookings.forEach(b => {
      const offset = 15;
      const dept   = userDeptMap[b.passenger?.toString()] || 'General';
      carpoolOffset += offset;
      if (departmentStats[dept]) departmentStats[dept].offsetKg += offset;
    });

    // Food
    let foodOffset = 0;
    foods.forEach(f => {
      const offset = f.carbonSaved || (f.quantity || 1) * 2.5;
      const dept   = userDeptMap[f.donor?.toString()] || 'General';
      foodOffset += offset;
      if (departmentStats[dept]) departmentStats[dept].offsetKg += offset;
    });

    const totalCO2Offset = treeOffset + carpoolOffset + foodOffset;
    const netCO2         = Math.max(0, totalCO2Generated - totalCO2Offset);

    const totalTrees     = donations.reduce((sum, d) => sum + (d.treesSponsored || 1), 0);
    const totalRides     = rides.length;
    const totalDonations = foods.length;
    const mealsSaved     = foods.reduce((sum, f) => sum + (f.quantity || 1), 0);
    const totalVideos    = videos.length;
    const totalViews     = videos.reduce((sum, v) => sum + (v.views || 0), 0);

    // ── Department table with net figures ──
    const employeeActivityChart = Object.keys(departmentStats).map(dept => {
      const emissionsKg = Number(departmentStats[dept].emissionsKg.toFixed(2));
      const offsetKg    = Number(departmentStats[dept].offsetKg.toFixed(2));
      const netKg       = Math.max(0, Number((emissionsKg - offsetKg).toFixed(2)));
      const budgetKg    = departmentStats[dept].activeUsers * 450;
      return { department: dept, emissionsKg, offsetKg, netKg, budgetKg };
    });

    const totalCompanyBudget = employees.length * 450;
    const totalICT           = totalGreenCoins;

    const ictSummary = {
      totalICT,
      totalEmissions: Number(totalCO2Generated.toFixed(2)),
      totalOffset:    Number(totalCO2Offset.toFixed(2)),
      netCO2:         Number(netCO2.toFixed(2)),
      budgetICT:      totalCompanyBudget,
      tradedICT:      0,
      perkValue:      totalICT * 50
    };

    // ── Dynamic graphs (last 6 months) ──
    const monthNames      = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const trendData       = [];
    const emissionTargets = [];

    for (let i = 5; i >= 0; i--) {
      const d        = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = monthNames[d.getMonth()];
      const monthNum = d.getMonth();
      const yearNum  = d.getFullYear();

      const sameMonthYear = (date) => {
        const dd = new Date(date);
        return dd.getMonth() === monthNum && dd.getFullYear() === yearNum;
      };

      const mRides  = rides.filter(r => sameMonthYear(r.createdAt || r.date)).length;
      const mFood   = foods
        .filter(f => sameMonthYear(f.createdAt || f.date))
        .reduce((s, f) => s + (f.quantity || 1), 0);
      const mTrees  = donations
        .filter(dn => sameMonthYear(dn.date || dn.createdAt))
        .reduce((s, dn) => s + (dn.treesSponsored || 1), 0);

      trendData.push({ month: monthStr, rides: mRides, food: mFood, trees: mTrees });

      const mEmissions = activities
        .filter(a => sameMonthYear(a.fromDate || a.createdAt))
        .reduce((s, a) => s + (a.totalEmission || a.carbonFootprint || 0), 0);

      const mOffset =
        rides.filter(r => sameMonthYear(r.createdAt || r.date)).length * 15 +
        foods.filter(f => sameMonthYear(f.createdAt || f.date))
             .reduce((s, f) => s + (f.carbonSaved || (f.quantity || 1) * 2.5), 0) +
        donations.filter(dn => sameMonthYear(dn.date || dn.createdAt))
                 .reduce((s, dn) => s + (dn.treesSponsored || 1) * 20, 0);

      emissionTargets.push({
        month:     monthStr,
        generated: Number((mEmissions / 1000).toFixed(3)),
        offset:    Number((mOffset    / 1000).toFixed(3)),
        net:       Number((Math.max(0, mEmissions - mOffset) / 1000).toFixed(3)),
        target:    Number(((totalCompanyBudget / 1000) / 12).toFixed(2))
      });
    }

    res.json({
      activeEmployees: employees.length,
      greenTrail: {
        totalCO2Generated: Number(totalCO2Generated.toFixed(2)),
        totalCO2Offset:    Number(totalCO2Offset.toFixed(2)),
        netCO2:            Number(netCO2.toFixed(2)),
        treeOffset:        Number(treeOffset.toFixed(2)),
        carpoolOffset:     Number(carpoolOffset.toFixed(2)),
        foodOffset:        Number(foodOffset.toFixed(2)),
        totalTrees
      },
      carpooling:     { totalRides, co2Saved: Number(carpoolOffset.toFixed(2)) },
      foodWaste:      { totalDonations, mealsSaved },
      ecoLearn:       { totalVideos, totalViews },
      trendData,
      departmentData: employeeActivityChart,
      emissionTargets,
      ictSummary
    });

  } catch (error) {
    console.error('Corporate Stats Error:', error);
    res.status(500).send('Error aggregating real corporate data');
  }
});

// ── /employee-profile/:userId ───────────────────────────────────────────────
router.get('/employee-profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const company = user.companyName;

    const leaderboardData = await User.find({ companyName: company })
      .sort({ greenCoins: -1 })
      .limit(10)
      .select('username greenCoins department')
      .lean();

    const allCompanyUsers = await User
      .find({ companyName: company })
      .sort({ greenCoins: -1 })
      .select('_id')
      .lean();

    const rank = allCompanyUsers.findIndex(
      u => u._id.toString() === user._id.toString()
    ) + 1;

    const now            = new Date();
    const thirtyDaysAgo  = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const ninetyDaysAgo  = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

    const userActivities = await Activity.find({
      $or: [{ userId: user._id }, { userId: user._id.toString() }]
    }).sort({ createdAt: -1 }).lean();

    let exactFootprint     = 0;
    let monthlyEmissions   = 0;
    let quarterlyEmissions = 0;

    userActivities.forEach(act => {
      const emission = act.totalEmission || act.carbonFootprint || 0;
      const actDate  = new Date(act.fromDate || act.createdAt || new Date());
      exactFootprint     += emission;
      if (actDate >= thirtyDaysAgo) monthlyEmissions   += emission;
      if (actDate >= ninetyDaysAgo) quarterlyEmissions += emission;
    });

    const currentFootprint = userActivities.length > 0
      ? Number(exactFootprint.toFixed(2))
      : (user.totalCarbonFootprint || (user.greenCoins > 0 ? user.greenCoins * 35 : 0));

    await User.findByIdAndUpdate(user._id, { totalCarbonFootprint: currentFootprint });

    const allDonations = await Donation.find({ user: user._id }).sort({ date: -1 }).lean();
    let monthlyOffset = 0, quarterlyOffset = 0, lifetimeOffset = 0;

    allDonations.forEach(d => {
      const offset = (d.treesSponsored || 1) * 20;
      const dDate  = new Date(d.date || d.createdAt || new Date());
      lifetimeOffset += offset;
      if (dDate >= thirtyDaysAgo) monthlyOffset   += offset;
      if (dDate >= ninetyDaysAgo) quarterlyOffset += offset;
    });

    const netMonthly   = Math.max(0, monthlyEmissions   - monthlyOffset);
    const netQuarterly = Math.max(0, quarterlyEmissions - quarterlyOffset);
    const netLifetime  = Math.max(0, currentFootprint   - lifetimeOffset);

    const formattedActivities = [];

    const rides = await Ride.find({ driver: user._id }).sort({ createdAt: -1 }).limit(3).lean();
    rides.forEach(r => formattedActivities.push({
      icon: '🚗', label: `Offered a carpool ride${r.origin ? ` from ${r.origin}` : ''}`,
      co2: 15, ict: 2, date: r.createdAt || r.date || new Date()
    }));

    const bookings = await Booking.find({ passenger: user._id, status: 'confirmed' })
      .sort({ createdAt: -1 }).limit(2).lean();
    bookings.forEach(b => formattedActivities.push({
      icon: '🚗', label: 'Completed a geo-verified carpool ride',
      co2: 12, ict: 2, date: b.createdAt || b.date || new Date()
    }));

    allDonations.slice(0, 10).forEach(d => {
      const trees = d.treesSponsored || 1;
      formattedActivities.push({
        icon: '🌳', label: `Offset ${trees} tree${trees > 1 ? 's' : ''} via GreenVerse donation`,
        co2: trees * 20, ict: trees * 4, date: d.date || d.createdAt || new Date()
      });
    });

    const foodDonations = await FoodDonation.find({ donor: user._id })
      .sort({ createdAt: -1 }).limit(5).lean();
    foodDonations.forEach(f => {
      const qty      = f.quantity || 1;
      const co2Saved = f.carbonSaved || Number((qty * 2.5).toFixed(1));
      formattedActivities.push({
        icon: '🍲', label: `Rescued ${qty} meal${qty > 1 ? 's' : ''} via Food Rescue Network`,
        co2: Number(co2Saved.toFixed(1)),
        ict: Math.max(1, Math.round(co2Saved / 5)),
        date: f.createdAt || f.date || new Date()
      });
    });

    const vidUploads = await EcoVideo.find({ user: user._id })
      .sort({ createdAt: -1 }).limit(2).lean();
    vidUploads.forEach(v => {
      const views = v.views || 0;
      formattedActivities.push({
        icon: '📹', label: `Uploaded "${v.title || 'sustainability video'}" to GreenStream`,
        co2: Number((views * 0.01).toFixed(1)),
        ict: 2 + Math.floor(views / 50),
        date: v.createdAt || v.date || new Date()
      });
    });

    userActivities.slice(0, 3).forEach(act => {
      const emission = Number((act.carbonFootprint || act.totalEmission || 0).toFixed(2));
      formattedActivities.push({
        icon: '🌱', label: `Logged carbon footprint — ${emission} kg`,
        co2: 0, ict: 1,
        date: act.timestamp || act.createdAt || act.fromDate || new Date()
      });
    });

    formattedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivities = formattedActivities.slice(0, 8);

    if (recentActivities.length === 0) {
      recentActivities.push({
        icon: '🌿',
        label: 'Start carpooling, donating food, or offsetting trees to see your impact here!',
        co2: 0, ict: 0, date: new Date()
      });
    }

    res.json({
      leaderboard:        leaderboardData,
      rank,
      totalInDept:        allCompanyUsers.length,
      activityFeed:       recentActivities,
      healedFootprint:    currentFootprint,
      monthlyEmissions:   Number(monthlyEmissions.toFixed(2)),
      monthlyOffset:      Number(monthlyOffset.toFixed(2)),
      netMonthly:         Number(netMonthly.toFixed(2)),
      quarterlyEmissions: Number(quarterlyEmissions.toFixed(2)),
      quarterlyOffset:    Number(quarterlyOffset.toFixed(2)),
      netQuarterly:       Number(netQuarterly.toFixed(2)),
      lifetimeOffset:     Number(lifetimeOffset.toFixed(2)),
      netLifetime:        Number(netLifetime.toFixed(2))
    });

  } catch (error) {
    console.error('Employee Profile Error:', error);
    res.status(500).json({ message: 'Failed to fetch dynamic employee data' });
  }
});

module.exports = router;