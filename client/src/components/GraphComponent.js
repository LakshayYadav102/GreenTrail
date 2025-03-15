import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const GraphComponent = ({ userId }) => {
  const [graphData, setGraphData] = useState({
    labels: [],
    values: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/activities/footprint/${userId}`);
        const { labels, values } = response.data;
        setGraphData({ labels, values });
        setLoading(false);
      } catch (err) {
        setError('Error fetching data for graph');
        setLoading(false);
      }
    };

    if (userId) {
      fetchGraphData();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading graph...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const chartData = {
    labels: graphData.labels,
    datasets: [
      {
        label: 'Carbon Footprint Over Time (kg CO2)',
        data: graphData.values,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default GraphComponent;
