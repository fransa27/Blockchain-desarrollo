import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import '../styles/Voltage.css';

const ThingspeakChart = () => {
  const [chartData, setChartData] = useState({});
  const [voltaje, setVoltaje] = useState(null);  // Voltaje desde Node-RED

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://api.thingspeak.com/channels/2448826/fields/1.json?api_key=X3ER4G02F52IQTSU&results=50`
        );

        const data = response.data.feeds;

        // Verificar que data y data.feeds existen y tienen elementos
        if (data && data.length > 0) {
          const timestamps = data.map(feed => feed.created_at).reverse();
          const values = data.map(feed => parseFloat(feed.field1) || 0).reverse(); // Asigna 0 si el valor no es numérico

          setChartData({
            labels: timestamps,
            datasets: [
              {
                label: 'Temperature',
                data: values,
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
              },
            ],
          });
        } else {
          console.error("No data available in ThingSpeak response.");
        }
      } catch (error) {
        console.error("Error fetching data from ThingSpeak:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Función para obtener el voltaje desde Node-RED
    const fetchVoltaje = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:1880/api/voltage');
        setVoltaje(response.data);
        console.log("response node-red: ", response);
        console.log("data response node-red: ", response.data);
      } catch (error) {
        console.error('Error al obtener el voltaje:', error);
      }
    };

    // Actualiza el voltaje cada 20 segundos
    const interval = setInterval(fetchVoltaje, 20000);

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (voltaje >= 8) {
      return 'green';
    } else if (voltaje > 4 && voltaje < 8) {
      return 'orange';
    } else {
      return 'red';
    }
  };

  return (
    <div>
      <h1>Meteorological Station</h1>
      <div style={{ width: '60rem', height: '20rem' }}>
        {chartData.labels ? (
          <Line data={chartData} />
        ) : (
          <p>Loading data...</p>
        )}
      </div>
      <div>
        <h1>Monitor de Voltaje</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2>Voltaje actual:</h2>
        <p
          style={{
            color: 'white',
            backgroundColor: getColor(),
            padding: '10px',
            borderRadius: '5px',
            display: 'inline-block'
          }}
        > 
          {voltaje !== null ? `${voltaje} V` : 'Cargando...'}
        </p> 
        </div>
      </div>
    </div>
  );
};

export default ThingspeakChart;
