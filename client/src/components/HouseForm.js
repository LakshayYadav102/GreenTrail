import React from 'react';
import { Form } from 'react-bootstrap';

const HouseForm = ({ houseData, setHouseData }) => {
  const handleChange = (e) => {
    setHouseData({
      ...houseData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="house-form">
      <Form.Group controlId="electricityUsage" className="eco-form-group">
        <Form.Label className="form-label">Electricity Usage (kWh/month)</Form.Label>
        <Form.Control
          type="number"
          name="electricityUsage"
          value={houseData.electricityUsage || ""}
          onChange={handleChange}
          className="eco-input"
          placeholder="Enter kWh"
        />
      </Form.Group>

      <Form.Group controlId="lpgUsage" className="eco-form-group">
        <Form.Label className="form-label">LPG Usage (kg/month)</Form.Label>
        <Form.Control
          type="number"
          name="lpgUsage"
          value={houseData.lpgUsage || ""}
          onChange={handleChange}
          className="eco-input"
          placeholder="Enter kg"
        />
      </Form.Group>

      <Form.Group controlId="renewableEnergy" className="eco-form-group">
        <Form.Label className="form-label">Renewable Energy</Form.Label>
        <Form.Control
          as="select"
          name="renewableEnergy"
          value={houseData.renewableEnergy || "none"}
          onChange={handleChange}
          className="eco-input"
        >
          <option value="none">No Renewable Energy</option>
          <option value="solar">Solar Panels</option>
          <option value="wind">Wind Energy</option>
          <option value="hydro">Hydropower</option>
        </Form.Control>
      </Form.Group>
    </div>
  );
};

export default HouseForm;