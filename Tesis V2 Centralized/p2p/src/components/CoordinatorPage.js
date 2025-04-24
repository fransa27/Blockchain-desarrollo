// src/components/CoordinadorPage.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoordinadorPage = () => {
    const [chartData, setChartData] = useState({});
    const [chartDataH2, setChartDataH2] = useState({});
    const navigate = useNavigate();
    const handleCoordinadorClick = () => {
        navigate('/');
     };

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
                    label: 'Power',
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
    const fetchData = async () => {
        try {
        const response = await axios.get(
            `https://api.thingspeak.com/channels/2448826/fields/2.json?api_key=X3ER4G02F52IQTSU&results=50`
        );

        const data = response.data.feeds;

        // Verificar que data y data.feeds existen y tienen elementos
        if (data && data.length > 0) {
            const timestamps = data.map(feed => feed.created_at).reverse();
            const values = data.map(feed => parseFloat(feed.field2) || 0).reverse(); // Asigna 0 si el valor no es numérico

            setChartDataH2({
            labels: timestamps,
            datasets: [
                {
                label: 'Power',
                data: values,
                borderColor: 'rgb(75, 192, 91)',
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

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            
            

            <h1>Control center</h1>
            <div>
                <p>House 1</p>
                <div style={{ width: '60rem', height: '20rem' }}>
                    {chartData.labels ? (
                    <Line data={chartData} />
                    ) : (
                    <p>Loading data...</p>
                    )}
                </div>
                <p>House 2</p>
                <div style={{ width: '60rem', height: '20rem' }}>
                    {chartDataH2.labels ? (
                    <Line data={chartDataH2} />
                    ) : (
                    <p>Loading data...</p>
                    )}
                </div>
            </div>
            <button onClick={handleCoordinadorClick} style={{ margin: '10px', padding: '5px 10px', backgroundColor: 'white' }}>
                Back
            </button>
        </div>
  );
};

export default CoordinadorPage;
