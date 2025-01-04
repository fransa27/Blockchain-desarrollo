const express = require('express');
const cors = require('cors');
const ewelink = require('ewelink-api');
const fs = require('fs'); // Importa el módulo 'fs'
require('dotenv').config();

const app = express();
app.use(cors()); // Permitir solicitudes desde React
app.use(express.json());

const connection = new ewelink({
    at: process.env.EWELINK_AT,
    region: process.env.EWELINK_REGION,
})
//device information
const testDevice = async () => {
  try {
    const device = await connection.getDevice(process.env.DEVICE_ID);
    console.log('Dispositivos:', device);

    // Escribe el objeto device en un archivo JSON
    fs.writeFile('device.json', JSON.stringify(device, null, 2), (err) => {
        if (err) {
          console.error('Error al escribir el archivo JSON:', err.message);
        } else {
          console.log('Información del dispositivo guardada en "device.json"');
        }
    });

  } catch (error) {
    console.error('Error al obtener dispositivos:', error.message);
  }
};

//uso diario
const getDevicePowerUsage = async () => {
    try {
        const usage = await connection.getDevicePowerUsage(process.env.DEVICE_ID);
        console.log('Ahora el powerUsage')
        console.log(usage);
    } catch (error) {
        console.error('Error al obtener informacion del dispositivo:', error.message);
    }
}

testDevice();

getDevicePowerUsage();


//ruta para acceder desde la APP React
app.get('/api/device', async (req, res) => {
  try {
    const connection = new ewelink({
      at: process.env.EWELINK_AT,
      region: process.env.EWELINK_REGION,
    });
    const device = await connection.getDevice(process.env.DEVICE_ID);
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//ruta para acceder a los datos mensuales desde la APP React
app.get('/api/mensual', async (req, res) => {
  try {
    const connection = new ewelink({
      at: process.env.EWELINK_AT,
      region: process.env.EWELINK_REGION,
    });
    const deviceMensual = await connection.getDevicePowerUsage(process.env.DEVICE_ID);
    res.json(deviceMensual);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
