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
    <Form>
      {/* 🍽️ Diet Choice */}
      <Form.Group controlId="diet">
        <Form.Label>Diet Type</Form.Label>
        <Form.Control
  as="select"
  name="diet"
  value={lifestyleData.diet || "vegetarian"}
  onChange={handleChange}
>
  <option value="vegetarian">Vegetarian</option>
  <option value="non_vegetarian">Non-Vegetarian</option>
  <option value="vegan">Vegan</option>
  <option value="pescatarian">Pescatarian</option>
</Form.Control>
      </Form.Group>

      {/* 🛍️ Clothing Consumption */}
      <Form.Group controlId="clothingPurchases">
        <Form.Label>Clothing Purchased per Month</Form.Label>
        <Form.Control
  type="number"
  name="clothingPurchases"
  value={lifestyleData.clothingPurchases || 0}
  onChange={handleChange}
  placeholder="Number of items"
/>

      </Form.Group>

      {/* 📱 Tech Usage */}
      <Form.Group controlId="screenTime">
        <Form.Label>Average Screen Time per Day (hours)</Form.Label>
        <Form.Control
  type="number"
  name="screenTime"
  value={lifestyleData.screenTime || 0}
  onChange={handleChange}
  placeholder="Enter hours"
/>

      </Form.Group>
    </Form>
  );
};

export default LifestyleForm;
