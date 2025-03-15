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
    <Form>
      {/* ⚡ Electricity Usage */}
      <Form.Group controlId="electricityUsage">
        <Form.Label>Electricity Usage (kWh per month)</Form.Label>
        <Form.Control
  type="number"
  name="electricityUsage"
  value={houseData.electricityUsage || ""}
  onChange={handleChange}
  placeholder="Enter electricity usage in kWh"
/>

      </Form.Group>

      {/* 🔥 LPG Usage */}
      <Form.Group controlId="lpgUsage">
        <Form.Label>LPG Usage (kg per month)</Form.Label>
        <Form.Control
  type="number"
  name="lpgUsage"
  value={houseData.lpgUsage || ""}
  onChange={handleChange}
  placeholder="Enter LPG usage in kg"
/>

      </Form.Group>

      {/* ☀️ Renewable Energy Usage */}
      <Form.Group controlId="renewableEnergy">
        <Form.Label>Renewable Energy Contribution</Form.Label>
        <Form.Control as="select" name="renewableEnergy" value={houseData.renewableEnergy || "none"} onChange={handleChange}>
  <option value="none">No Renewable Energy</option>
  <option value="solar">Solar Panels</option>
  <option value="wind">Wind Energy</option>
  <option value="hydro">Hydropower</option>
</Form.Control>

      </Form.Group>
    </Form>
  );
};

export default HouseForm;
