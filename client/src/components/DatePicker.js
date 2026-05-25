import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

// 🔧 FIX 1: Get today's date in LOCAL timezone (not UTC)
// new Date().toISOString() gives UTC which is 5:30 behind IST
// This function always returns the correct local date as YYYY-MM-DD
const getLocalToday = () => {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalDateString = (date) => {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DatePicker = ({ fromDate, toDate, onFromDateChange, onToDateChange, maxDate }) => {
  const [preset, setPreset] = useState('custom');

  // 🔧 FIX 2: Use local today for max, ignoring the UTC-based maxDate prop
  const localToday = getLocalToday();

  const handlePreset = (selection) => {
    setPreset(selection);
    if (selection === 'custom') return;

    const end   = new Date();
    const start = new Date();

    if (selection === 'today') {
      // both stay as today
    } else if (selection === 'yesterday') {
      start.setDate(end.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (selection === 'last7') {
      start.setDate(end.getDate() - 6);
    } else if (selection === 'last30') {
      start.setDate(end.getDate() - 29);
    }

    // 🔧 Use local date string instead of toISOString()
    onFromDateChange(getLocalDateString(start));
    onToDateChange(getLocalDateString(end));
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '...';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    // Parse as local date to avoid off-by-one from UTC conversion
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', options);
  };

  return (
    <div className="gt-enhanced-datepicker">

      {/* PRESET BUTTONS */}
      <div className="gt-date-presets">
        {['today','yesterday','last7','last30','custom'].map((key) => (
          <button
            key={key}
            className={`gt-preset-btn ${preset === key ? 'active' : ''}`}
            onClick={() => handlePreset(key)}
          >
            {key === 'today'     ? 'Today'       :
             key === 'yesterday' ? 'Yesterday'   :
             key === 'last7'     ? 'Last 7 Days' :
             key === 'last30'    ? 'Last 30 Days':
             'Custom'}
          </button>
        ))}
      </div>

      {/* SELECTED RANGE DISPLAY */}
      {(fromDate || toDate) && (
        <div className="gt-date-display-bar">
          <FaClock className="gt-date-clock-icon" />
          <span>Calculating footprint for: </span>
          <strong className="text-white">
            {formatDisplayDate(fromDate)}
            <span style={{ color: '#2ecc71', margin: '0 8px' }}>→</span>
            {formatDisplayDate(toDate)}
          </strong>
        </div>
      )}

      {/* 🔧 FIX 3: Custom date inputs — proper width + max set to localToday */}
      {preset === 'custom' && (
        <div
          className="date-input-group mt-3"
          style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
        >
          <div className="date-input" style={{ flex: '1 1 140px', minWidth: '140px' }}>
            <label
              className="date-label mb-2 d-block text-white"
              style={{ fontSize: '0.9rem', fontWeight: '600' }}
            >
              <FaCalendarAlt className="date-icon me-2 text-success" /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              max={localToday}          // 🔧 blocks future dates, uses local date
              onChange={(e) => {
                onFromDateChange(e.target.value);
                setPreset('custom');
              }}
              style={{
                width: '100%',
                minWidth: '140px',
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                colorScheme: 'dark'     // 🔧 makes the calendar icon white on dark bg
              }}
            />
          </div>

          <div className="date-input" style={{ flex: '1 1 140px', minWidth: '140px' }}>
            <label
              className="date-label mb-2 d-block text-white"
              style={{ fontSize: '0.9rem', fontWeight: '600' }}
            >
              <FaCalendarAlt className="date-icon me-2 text-success" /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              max={localToday}          // 🔧 blocks future dates, uses local date
              min={fromDate || undefined} // 🔧 bonus: To Date can't be before From Date
              onChange={(e) => {
                onToDateChange(e.target.value);
                setPreset('custom');
              }}
              style={{
                width: '100%',
                minWidth: '140px',
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                colorScheme: 'dark'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;