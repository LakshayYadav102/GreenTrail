import React from 'react';
import { Form } from 'react-bootstrap';

const DatePicker = ({ fromDate, toDate, onFromDateChange, onToDateChange }) => {
  return (
    <Form style={{ color: 'white' }}>
      <Form.Group controlId="fromDate" style={{ backgroundColor: '#444', padding: '10px', borderRadius: '5px' }}>
        <Form.Label>From</Form.Label>
        <Form.Control
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          style={{ backgroundColor: '#555', color: 'white' }}
        />
      </Form.Group>

      <Form.Group controlId="toDate" style={{ backgroundColor: '#444', padding: '10px', borderRadius: '5px' }}>
        <Form.Label>To</Form.Label>
        <Form.Control
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          style={{ backgroundColor: '#555', color: 'white' }}
        />
      </Form.Group>
    </Form>
  );
};

export default DatePicker;
