import React from 'react';
import { Form } from 'react-bootstrap';

const TransportForm = ({ transportData, setTransportData }) => {
  const handleChange = (e) => {
    setTransportData({
      ...transportData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Form>
      {/* 🚗 Distance Traveled */}
      <Form.Group controlId="distance">
        <Form.Label>Distance Traveled (km)</Form.Label>
        <Form.Control
          type="number"
          name="distance"
          value={transportData.distance}
          onChange={handleChange}
          placeholder="Enter distance in kilometers"
        />
      </Form.Group>

      {/* 🚕 Mode of Transport */}
      <Form.Group controlId="transportType">
        <Form.Label>Mode of Transport</Form.Label>
        <Form.Control as="select" name="transportType" value={transportData.transportType} onChange={handleChange}>
          <option value="petrol">Car (Petrol)</option>
          <option value="diesel">Car (Diesel)</option>
          <option value="cng">Car (CNG)</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="flight_short">Flight (Short Haul)</option>
          <option value="flight_long">Flight (Long Haul)</option>
          <option value="bicycle">Bicycle</option>
          <option value="walking">Walking</option>
        </Form.Control>
      </Form.Group>
    </Form>
  );
};

export default TransportForm;
