const mongoose = require('mongoose');

const FacilityEmissionSchema = new mongoose.Schema({
  companyName: { 
    type: String, 
    required: true,
    lowercase: true
  },
  month: { 
    type: String, 
    required: true 
  },
  electricity: { 
    type: Number, 
    required: true 
  },
  servers: { 
    type: Number, 
    required: true 
  },
  fleet: { 
    type: Number, 
    required: true 
  },
  totalTons: { 
    type: Number, 
    required: true 
  },
  loggedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('FacilityEmission', FacilityEmissionSchema);