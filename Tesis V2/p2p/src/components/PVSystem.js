import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsonData from '../data/data.json'; // Importa tu archivo JSON

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PVSystem = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    // Simular carga de datos desde JSON
    const dataFromJson = jsonData; // Aquí es donde cargamos los datos del archivo JSON

    // Configurar los datos del gráfico
    setChartData({
      labels: dataFromJson.labels,
      datasets: [
        {
          label: 'Dataset',
          data: dataFromJson.data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
        },
      ],
    });
  }, []);

  return (
    <div>
      <h2>Gráfico de ejemplo</h2>
      <Line data={chartData} />
    </div>
  );
};

export default PVSystem;
