require("dotenv").config();
const express = require("express");
const Web3 = require("web3");
const fs = require("fs");

const app = express();
app.use(express.json());

// Cargar variables de entorno
const { GANACHE_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

// Inicializar Web3
const web3 = new Web3(GANACHE_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// Cargar ABI
const contractJson = JSON.parse(fs.readFileSync("./EnergyOracle.json"));
const contract = new web3.eth.Contract(contractJson.abi, CONTRACT_ADDRESS);

// Ruta del oráculo
app.post("/report-energy", async (req, res) => {
    const { energy } = req.body;
    try {
        const tx = await contract.methods.reportEnergy(energy).send({
            from: account.address,
            gas: 200000,
        });
        console.log("Transacción enviada:", tx.transactionHash);
        res.status(200).send({ txHash: tx.transactionHash });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al reportar energía");
    }
});

app.listen(3000, () => {
    console.log("🧙 Oráculo escuchando en http://localhost:3000");
});
