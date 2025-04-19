import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from "react-chartjs-2";

const DeviceControl = () => {
  const [devices, setDevices] = useState([]); // Estado para almacenar los dispositivos
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar errores

  const [infoMensual, setInfoMensual] = useState([]);
  const [loadingMensual, setLoadingMensual] = useState(true); 
  const [errorMensual, setErrorMensual] = useState(null);  

  const THINGSPEAK_API_KEY = "TU_WRITE_API_KEY"; // Reemplaza con tu clave de escritura de ThingSpeak

  const sendToThingSpeak = async (data) => {
    try {
      const response = await axios.post('https://api.thingspeak.com/update', null, {
        params: {
          api_key: process.env.THINGSPEAK_API_KEY,
          field5: data.voltage,
          field6: data.current,
          field7: data.power,
          field8: data.energyUsage,
        },
      });

      if (response.data === 0) {
        console.error("Error al enviar datos a ThingSpeak.");
      } else {
        console.log("Datos enviados a ThingSpeak. Entry ID:", response.data);
      }
    } catch (error) {
      console.error("Error al enviar datos a ThingSpeak:", error);
    }
  };

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        setLoading(true); // Inicia el estado de carga
        const { data } = await axios.get('http://localhost:5000/api/device');
        console.log('Datos recibidos:', data);

        if (Array.isArray(data)) {
          setDevices(data);
          // Publicar datos de cada dispositivo a ThingSpeak
          data.forEach(device => {
            const deviceData = {
              power: device.params?.power || 0,
              voltage: device.params?.voltage || 0,
              current: device.params?.current || 0,
              energyUsage: device.params?.energyUsage || 0,
            };
            sendToThingSpeak(deviceData);
          });
        } else if (data && typeof data === 'object') {
          setDevices([data]); // Si es un objeto, lo convierte en un array
          const deviceData = {
            power: data.params?.power || 0,
            voltage: data.params?.voltage || 0,
            current: data.params?.current || 0,
            energyUsage: data.params?.energyUsage || 0,
          };
          sendToThingSpeak(deviceData);
        } else {
          throw new Error('Estructura de datos inesperada');
        }
      } catch (error) {
        console.error('Error al obtener info del dispositivo:', error);
        setError('No se pudo obtener la información de los dispositivos.');
      } finally {
        setLoading(false); // Termina el estado de carga
      }
    };

    // Llama a fetchDevice inmediatamente
    fetchDevice();

    // Configura el intervalo para repetir la solicitud cada 1 hora
    const intervalId = setInterval(fetchDevice, 60 * 60 * 1000); // 1 hora = 60 minutos * 60 segundos * 1000 ms

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchDeviceMensual = async () => {
      try {
        setLoadingMensual(true);
        const { data } = await axios.get('http://localhost:5000/api/mensual');
        console.log('Datos recibidos mensual:', data);

        if (data.status === 'ok' && Array.isArray(data.daily)) {
          setInfoMensual(data.daily.reverse());
        } else {
          throw new Error('Estructura de datos inesperada');
        }
      } catch (error) {
        console.error('Error al obtener info del dispositivo:', error);
        setErrorMensual('No se pudo obtener la información de los dispositivos.');
      } finally {
        setLoadingMensual(false);
      }
    };

    fetchDeviceMensual();
  }, []);

  // Preparar datos para el gráfico
  const chartData = React.useMemo(() => {
    if (!infoMensual) return null;

    return {
      labels: infoMensual.map((item) => `Día ${item.day}`), // Etiquetas de días
      datasets: [
        {
          label: 'Uso Diario de Energía (kWh)',
          data: infoMensual.map((item) => item.usage), // Valores de uso
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
      ],
    };
  }, [infoMensual]);

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Día del Mes',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Consumo (kWh)',
        },
        beginAtZero: true,
      },
    },
  }), []);


  return (
    <div>
      <h1>Smart Meter</h1>
        <div style={{ display: 'flex', gap: '20px'}}>
            {loading ? (
                <p>No hay dispositivos disponibles.</p>
            ) : error ? (
                <p>{error}</p>
            ) : devices.length > 0 ? (
                devices.map((device, index) => (
                <div key={device.deviceid || index}>
                    <h3>Device name: {device.name || 'Dispositivo sin nombre'}</h3>
                    <p>Power: {device.params?.power || 'Desconocido'} </p>
                    <p>Voltage: {device.params?.voltage || 'Desconocido' }</p>
                    <p>Current: {device.params?.current || 'Desconocido'}</p>
                </div>
                ))
            ) : (
                <p>No hay dispositivos disponibles.</p>
            )}
            <div>
                <h3>Consumo diario en el ultimo mes a la fecha</h3>
                {loadingMensual ? (
                    <p>Cargando datos...</p>
                ) : errorMensual ? (
                    <p>{errorMensual}</p>
                ) : chartData ? (
                    <div style={{ width: '800px', height: '600px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <p>No hay datos disponibles para graficar.</p>
                )}
            </div>
        </div>
      

    </div>
  );
};

export default DeviceControl;
