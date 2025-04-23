import React from 'react';
import { FaTree, FaLeaf } from 'react-icons/fa';

const ResultsPage = ({ carbonFootprint }) => {
  const getImpactLevel = (footprint) => {
    if (footprint < 100) return 'Very Low';
    if (footprint < 300) return 'Low';
    if (footprint < 600) return 'Moderate';
    if (footprint < 1000) return 'High';
    return 'Very High';
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <FaTree className="result-icon" />
        <h3>Your Carbon Footprint Results</h3>
      </div>
      
      <div className="result-card primary">
        <div className="result-value">{carbonFootprint.toFixed(2)}</div>
        <div className="result-unit">kg CO₂</div>
        <div className="result-label">Total Carbon Footprint</div>
      </div>
      
      <div className="result-card secondary">
        <FaLeaf className="impact-icon" />
        <div className="impact-level">{getImpactLevel(carbonFootprint)}</div>
        <div className="impact-label">Environmental Impact</div>
      </div>
    </div>
  );
};

export default ResultsPage;