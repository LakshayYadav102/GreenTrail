import React from 'react';

const ResultsPage = ({ carbonFootprint }) => {
  return (
    <div>
      <h3>Your Carbon Footprint</h3>
      <p>Total Carbon Footprint: <strong>{carbonFootprint} kg CO2</strong></p>
    </div>
  );
};

export default ResultsPage;
