import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PVSystem = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const [PVVoltage, setPVVoltage] = useState(null);
  const [PVPower, setPVPower] = useState(null);
  const [BESSVoltage, setBESSVoltage] = useState(null);

  // Gráfico de potencia PV desde ThingSpeak
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://api.thingspeak.com/channels/1933417/fields/3.json?api_key=SV5ATWY4GR8J42L7&results=50`
        );

        const data = response.data.feeds;
        if (data && data.length > 0) {
          const timestamps = data.map(feed => feed.created_at).reverse();
          const values = data.map(feed => parseFloat(feed.field3) || 0).reverse();

          setChartData({
            labels: timestamps,
            datasets: [
              {
                label: 'PV Power',
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
        console.error("Error fetching chart data from ThingSpeak:", error);
      }
    };

    fetchChartData();
  }, []);

  // Obtener últimas mediciones desde ThingSpeak con respaldo en Node-RED
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // Intenta obtener los datos desde ThingSpeak
        const [pvPowerTS, pvVoltageTS, bessVoltageTS] = await Promise.all([
          axios.get(`https://api.thingspeak.com/channels/1933417/fields/3/last.json?api_key=SV5ATWY4GR8J42L7`),
          axios.get(`https://api.thingspeak.com/channels/1933417/fields/1/last.json?api_key=SV5ATWY4GR8J42L7`),
          axios.get(`https://api.thingspeak.com/channels/1933417/fields/5/last.json?api_key=SV5ATWY4GR8J42L7`)
        ]);

        // Asignar valores desde ThingSpeak
        const power = parseFloat(pvPowerTS.data.field3);
        const voltagePV = parseFloat(pvVoltageTS.data.field1);
        const voltageBESS = parseFloat(bessVoltageTS.data.field5);

        if (!isNaN(power)) setPVPower(power);
        if (!isNaN(voltagePV)) setPVVoltage(voltagePV);
        if (!isNaN(voltageBESS)) setBESSVoltage(voltageBESS);

        console.log("Datos desde ThingSpeak actualizados.");
      } catch (tsError) {
        console.warn("ThingSpeak falló. Intentando desde Node-RED...");

        try {
          const [pvPowerRes, pvVoltageRes, bessVoltageRes] = await Promise.all([
            axios.get('http://127.0.0.1:1880/api/pv_power'),
            axios.get('http://127.0.0.1:1880/api/pv'),
            axios.get('http://127.0.0.1:1880/api/bess_voltage'),
          ]);

          setPVPower(pvPowerRes.data);
          setPVVoltage(pvVoltageRes.data);
          setBESSVoltage(bessVoltageRes.data);

          console.log("Datos cargados desde Node-RED como respaldo.");
        } catch (nrError) {
          console.error("Error al obtener datos desde Node-RED:", nrError);
        }
      }
    };

    fetchLatestData(); // Carga inicial
    const interval = setInterval(fetchLatestData, 20000); // Cada 20 segundos

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ textAlign: 'left' }}>
      <h1>PV Monitoring</h1>
  
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '40px',
          marginTop: '30px'
        }}
      >
        {/* Gráfico a la izquierda */}
        <div style={{ width: '60rem', height: '20rem' }}>
          {chartData.labels.length > 0 ? (
            <Line data={chartData} />
          ) : (
            <p>Loading data...</p>
          )}
        </div>
  
        {/* Información a la derecha en dos columnas */}
        <div style={{marginTop: '2px'}}>
          <h2>Actual monitoring energy</h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '30px',
              marginTop: '20px'
            }}
          >
            {/* Columna 1 */}
            <div>
              <h3>PV voltage:</h3>
              <p style={styleBox}>{PVVoltage !== null ? `${PVVoltage} V` : 'Cargando...'}</p>
  
              <h3 style={{ marginTop: '20px' }}>PV power:</h3>
              <p style={styleBox}>{PVPower !== null ? `${PVPower} W` : 'Cargando...'}</p>
            </div>
  
            {/* Columna 2 */}
            <div>
              <h3>Battery voltage:</h3>
              <p style={styleBox}>{BESSVoltage !== null ? `${BESSVoltage} V` : 'Cargando...'}</p>
  
              {/* Puedes agregar más datos aquí si los deseas */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  
};
//arreglar los colores de las barras
const styleBox = {
  color: 'white',
  backgroundColor: 'green',
  padding: '10px',
  borderRadius: '10px',
  display: 'inline-block'
};

export default PVSystem;
