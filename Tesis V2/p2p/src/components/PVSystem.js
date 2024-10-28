import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import jsonData from '../data/data.json'; // Importa tu archivo JSON
import axios from 'axios';


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

  //node-red
  const [PVVoltage, setPVVoltaje] = useState(null);  // Voltaje 

  useEffect(() => {
    const fetchPV = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:1880/api/pv');
        setPVVoltaje(response.data);
        console.log("response node-red pv: ", response);
        console.log("data response node-red pv: ", response.data);
      } catch (error) {
        console.error('Error al obtener el voltaje:', error);
      }
    };
    // Actualiza el voltaje cada 20 segundos
    const interval = setInterval(fetchPV, 20000);

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Gráfico de ejemplo</h2>
      <Line data={chartData} />

      <h1>Monitor de Voltaje en las Baterias</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <h2>Voltaje actual:</h2>
      <p
        style={{
          color: 'white',
          backgroundColor: 'green',
          padding: '10px',
          borderRadius: '5px',
          display: 'inline-block'
        }}
      > 
        {PVVoltage !== null ? `${PVVoltage} V` : 'Cargando...'}
      </p> 
      </div>


    </div>
  );
};

export default PVSystem;
