const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  // 🌟 FIX: Extract department and companyName explicitly from req.body
  const { username, email, password, department, companyName } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.error(`Email already in use: ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🏢 Corporate and Auditor Email Detection Logic
    let assignedRole = 'user';
    let assignedCompanyName = companyName || '';

    const corporateDomains = ['@techcorp.com', '@company.com', '@greenverseb2b.com'];
    const auditorDomains = ['@auditortechcorp.com'];
    
    if (corporateDomains.some(domain => email.endsWith(domain))) {
      assignedRole = 'corporate';
      if (!assignedCompanyName) assignedCompanyName = email.split('@')[1].split('.')[0]; 
    } else if (auditorDomains.some(domain => email.endsWith(domain))) {
      assignedRole = 'auditor';
      if (!assignedCompanyName) assignedCompanyName = email.split('@')[1].split('.')[0];
    }

    // 🌟 FIX: Save the exact department selected from the frontend dropdown
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      role: assignedRole,
      companyName: assignedCompanyName,
      department: department || 'General' // Saves the specific department!
    });

    await newUser.save();

    console.log(`User registered successfully: ${username} (${email}) [Dept: ${newUser.department}]`);
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (err) {
    console.error('Error in Register Route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      token, 
      userId: user._id, 
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      department: user.department
    });

  } catch (err) {
    console.error('Error in Login Route:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;