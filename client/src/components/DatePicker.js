import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const DatePicker = ({ fromDate, toDate, onFromDateChange, onToDateChange }) => {
  return (
    <div className="date-picker-container">
      <div className="date-input-group">
        <div className="date-input">
          <label className="date-label">
            <FaCalendarAlt className="date-icon" />
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="date-input-field"
          />
        </div>
        
        <div className="date-input">
          <label className="date-label">
            <FaCalendarAlt className="date-icon" />
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="date-input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default DatePicker;