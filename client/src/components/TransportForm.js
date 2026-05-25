import React, { useState } from 'react';

const VEHICLE_OPTIONS = [
  { value: 'petrol',       label: 'Car (Petrol)',        icon: '🚗', factor: 0.21 },
  { value: 'diesel',       label: 'Car (Diesel)',        icon: '🚗', factor: 0.24 },
  { value: 'cng',          label: 'Car (CNG)',            icon: '🚗', factor: 0.07 },
  { value: 'two_wheeler',  label: 'Two Wheeler / Bike',   icon: '🏍️', factor: 0.09 },
  { value: 'bus',          label: 'Bus',                  icon: '🚌', factor: 0.03 },
  { value: 'train',        label: 'Train',                icon: '🚆', factor: 0.01 },
  { value: 'flight_short', label: 'Flight (Short Haul)',  icon: '✈️', factor: 0.15 },
  { value: 'flight_long',  label: 'Flight (Long Haul)',   icon: '✈️', factor: 0.20 },
  { value: 'bicycle',      label: 'Bicycle',              icon: '🚲', factor: 0    },
  { value: 'walking',      label: 'Walking',              icon: '🚶', factor: 0    },
];

// Distance range bands — mid-point used for calculation
const DISTANCE_RANGES = [
  { label: '0 – 5 km',    min: 0,   max: 5,    mid: 2.5  },
  { label: '5 – 10 km',   min: 5,   max: 10,   mid: 7.5  },
  { label: '10 – 20 km',  min: 10,  max: 20,   mid: 15   },
  { label: '20 – 40 km',  min: 20,  max: 40,   mid: 30   },
  { label: '40 – 70 km',  min: 40,  max: 70,   mid: 55   },
  { label: '70 – 100 km', min: 70,  max: 100,  mid: 85   },
  { label: '100 – 150 km',min: 100, max: 150,  mid: 125  },
  { label: '150 – 200 km',min: 150, max: 200,  mid: 175  },
  { label: '200+ km',     min: 200, max: 300,  mid: 250  },
];

const TransportForm = ({ transportData, setTransportData }) => {
  const vehicles = transportData.vehicles || [];
  const [selectedVehicle, setSelectedVehicle] = useState('petrol');
  const [selectedRange, setSelectedRange]     = useState(DISTANCE_RANGES[0].label);

  const addVehicle = () => {
    const alreadyAdded = vehicles.some(
      v => v.vehicleType === selectedVehicle && v.distanceRange === selectedRange
    );
    if (alreadyAdded) return;

    const range   = DISTANCE_RANGES.find(r => r.label === selectedRange);
    const vehicle = VEHICLE_OPTIONS.find(v => v.value === selectedVehicle);

    const newEntry = {
      vehicleType:   selectedVehicle,
      vehicleLabel:  vehicle.label,
      vehicleIcon:   vehicle.icon,
      distanceRange: selectedRange,
      distanceMid:   range.mid, 
      emissionFactor: vehicle.factor,
    };

    const updated = [...vehicles, newEntry];
    setTransportData({ ...transportData, vehicles: updated });
  };

  const removeVehicle = (index) => {
    const updated = vehicles.filter((_, i) => i !== index);
    setTransportData({ ...transportData, vehicles: updated });
  };

  const previewCO2 = (entry) => (entry.distanceMid * entry.emissionFactor).toFixed(2);

  return (
    <div className="gt-transport-form">

      {/* ── VEHICLE SELECTOR ── */}
      <div className="gt-transport-selectors">
        <div className="gt-transport-field">
          <label className="form-label">Vehicle / Mode</label>
          <select
            value={selectedVehicle}
            onChange={e => setSelectedVehicle(e.target.value)}
            className="eco-input"
            title={VEHICLE_OPTIONS.find(v => v.value === selectedVehicle)?.label || ''}
          >
            {VEHICLE_OPTIONS.map(v => (
              <option key={v.value} value={v.value}>
                {v.icon} {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="gt-transport-field">
          <label className="form-label">Distance Range</label>
          <select
            value={selectedRange}
            onChange={e => setSelectedRange(e.target.value)}
            className="eco-input"
          >
            {DISTANCE_RANGES.map(r => (
              <option key={r.label} value={r.label}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── ADD BUTTON (UX FIX) ── */}
      <button
        type="button"
        className="gt-transport-add-btn"
        onClick={addVehicle}
        style={vehicles.length === 0 ? { 
          backgroundColor: '#f39c12', 
          color: '#000', 
          transform: 'scale(1.02)',
          boxShadow: '0 0 15px rgba(243, 156, 18, 0.5)'
        } : {}}
      >
        {vehicles.length === 0 ? '👈 Click Here to Add Vehicle' : '+ Add Another Vehicle'}
      </button>

      {/* ── ADDED VEHICLES LIST ── */}
      {vehicles.length === 0 ? (
        <div className="gt-transport-empty">
          <p>No vehicles added yet. Select a vehicle and distance range above and click <strong>Add Vehicle</strong>.</p>
        </div>
      ) : (
        <div className="gt-transport-list">
          <p className="gt-transport-list-title">Your trips for this period:</p>
          {vehicles.map((entry, i) => (
            <div key={i} className="gt-transport-entry">
              <span className="gt-transport-entry-icon">{entry.vehicleIcon}</span>
              <div className="gt-transport-entry-info">
                <p className="gt-transport-entry-label">{entry.vehicleLabel}</p>
                <p className="gt-transport-entry-range">{entry.distanceRange}</p>
              </div>
              <div className="gt-transport-entry-co2">
                {entry.emissionFactor > 0 ? (
                  <>
                    <span className="gt-transport-co2-val">~{previewCO2(entry)} kg</span>
                    <span className="gt-transport-co2-unit">CO₂e</span>
                  </>
                ) : (
                  <span className="gt-transport-co2-zero">0 emissions ♻️</span>
                )}
              </div>
              <button
                type="button"
                className="gt-transport-remove-btn"
                onClick={() => removeVehicle(i)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="gt-transport-total">
            <span>Estimated transport total:</span>
            <strong style={{ color: '#69f0ae' }}>
              ~{vehicles.reduce((sum, e) => sum + e.distanceMid * e.emissionFactor, 0).toFixed(2)} kg CO₂e
            </strong>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransportForm;