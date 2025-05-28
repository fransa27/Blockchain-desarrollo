const { ethers } = require("ethers");
const mqtt = require("mqtt");

// === Configuración ===
const GANACHE_URL = "http://127.0.0.1:7545"; // Puerto por defecto de Ganache GUI 8545 es en la raspby
const CONTRACT_ADDRESS = "0x800F27A616c8F4471a18a11AABc9b9c7A22D7A22"; // Dirección de tu contrato
//const ABI = require('./abi/contracts/Marketplace.json'); //cambiar en el caso de centralizado 
const contractJson = require('./abi/contracts/Marketplace.json');
const ABI = contractJson.abi;

const MQTT_BROKER = "http://192.168.0.193:1883"; //borker HEMS/EMA
const MQTT_TOPIC_ENERGY = "p2p/energy"; //publish
const MQTT_TOPIC_RELE = "p2p/rele";
console.log("hola")
// === Inicialización de clientes ===
const provider = new ethers.JsonRpcProvider(GANACHE_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const mqttClient = mqtt.connect(MQTT_BROKER);
let ultimaTransaccionIndex = 0;
mqttClient.on("connect", () => {
  console.log("Conectado al broker MQTT");

  setInterval(async () => {
    try {
      const total = await contract.getCantidadTransacciones();

      // Recorremos solo nuevas transacciones
      for (let i = ultimaTransaccionIndex; i < total; i++) {
        const [id, price, energy, buyer, seller] = await contract.getTransaccion(i);

        console.log(`Transacción #${id}: ${energy}kWh entre ${seller} → ${buyer}`);
        
        mqttClient.publish(MQTT_TOPIC_ENERGY, energy); // Enviar energía
        //mqttClient.publish(MQTT_TOPIC_RELE, 'true');   // Activar rele

        ultimaTransaccionIndex++; // Avanza al siguiente
      }
    } catch (error) {
      console.error("Error al leer transacciones:", error.message);
    }
  }, 10000); // Cada 10 segundos
});
