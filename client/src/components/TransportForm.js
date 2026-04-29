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
    <div className="transport-form">
      <Form.Group controlId="distance" className="eco-form-group">
        <Form.Label className="form-label">Distance Traveled (km)</Form.Label>
        <Form.Control
          type="number"
          name="distance"
          value={transportData.distance || 0}
          onChange={handleChange}
          className="eco-input"
          placeholder="Enter distance in km"
        />
      </Form.Group>

      <Form.Group controlId="transportType" className="eco-form-group">
        <Form.Label className="form-label">Mode of Transport</Form.Label>
        <Form.Control
          as="select"
          name="transportType"
          value={transportData.transportType || 'petrol'}
          onChange={handleChange}
          className="eco-input"
        >
          <option value="petrol">Car (Petrol)</option>
          <option value="diesel">Car (Diesel)</option>
          <option value="cng">Car (CNG)</option>
          <option value="two_wheeler">Two Wheeler / Motorbike</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="flight_short">Flight (Short Haul)</option>
          <option value="flight_long">Flight (Long Haul)</option>
          <option value="bicycle">Bicycle</option>
          <option value="walking">Walking</option>
        </Form.Control>
      </Form.Group>
    </div>
  );
};

export default TransportForm;