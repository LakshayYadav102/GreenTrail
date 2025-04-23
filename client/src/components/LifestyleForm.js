import React from 'react';
import { Form } from 'react-bootstrap';

const LifestyleForm = ({ lifestyleData, setLifestyleData }) => {
  const handleChange = (e) => {
    setLifestyleData({
      ...lifestyleData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="lifestyle-form">
      <Form.Group controlId="diet" className="eco-form-group">
        <Form.Label className="form-label">Diet Type</Form.Label>
        <Form.Control
          as="select"
          name="diet"
          value={lifestyleData.diet || "vegetarian"}
          onChange={handleChange}
          className="eco-input"
        >
          <option value="vegetarian">Vegetarian</option>
          <option value="non_vegetarian">Non-Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="pescatarian">Pescatarian</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="clothingPurchases" className="eco-form-group">
        <Form.Label className="form-label">Clothing Purchases (items/month)</Form.Label>
        <Form.Control
          type="number"
          name="clothingPurchases"
          value={lifestyleData.clothingPurchases || 0}
          onChange={handleChange}
          className="eco-input"
          placeholder="Number of items"
        />
      </Form.Group>

      <Form.Group controlId="screenTime" className="eco-form-group">
        <Form.Label className="form-label">Screen Time (hours/day)</Form.Label>
        <Form.Control
          type="number"
          name="screenTime"
          value={lifestyleData.screenTime || 0}
          onChange={handleChange}
          className="eco-input"
          placeholder="Enter hours"
        />
      </Form.Group>
    </div>
  );
};

export default LifestyleForm;