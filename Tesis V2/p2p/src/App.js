import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Marketplace from './abi/contracts/Marketplace.json';
import Navbar from './components/Navbar';
import Main from './components/Main';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Páginas que vamos a rutear
import HEMS from './components/HEMS';
import PVSystem from './components/PVSystem';
import DeviceControl from "./components/SonOFFInfo";
//import CoordinadorPage from './components/CoordinatorPage';
//import LoginPage from './components/LoginPage';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    //console.log("netID: ", networkId)
    const networkData = Marketplace.networks[networkId];
    //console.log("net: ", networkData)
    if (networkData) {
      const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
      this.setState({ marketplace });

      const productCount = await marketplace.methods.productCount().call();
      this.setState({ productCount });

      for (let i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState({
          products: [...this.state.products, product]
        });
      }
      //los disponibles para yo vender
      const productCount_buyer = await marketplace.methods.productCount_buyer().call();
      this.setState({ productCount_buyer });

      for (let i = 1; i <= productCount_buyer; i++) {
        const request = await marketplace.methods.products_buyer(i).call();
        this.setState({
          products_buyer: [...this.state.products_buyer, request]
        });
      }

      this.setState({ loading: false });
    } else {
      window.alert('Marketplace contract not deployed to detected network.');
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      products_buyer: [],
      loading: true
    };

    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
    this.createProduct_buyer = this.createProduct_buyer.bind(this);
    //this.sellToBuyerRequest = this.sellToBuyerRequest(this);
  }

  /* createProduct(name, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
        window.location.reload();  // Recarga la página después de la confirmación
      });
  } */
  createProduct(energy, price) {
    console.log("Energia", energy);
    console.log("precio ",price);
    this.setState({ loading: true });
    try {
      this.state.marketplace.methods.createProduct(energy, price).send({ from: this.state.account }) //.send({from: this.state.account, gas: 30000000, gasPrice: window.web3.utils.toWai('20','gwei'),type:'0x0'}) //para el server cambiar por eso
        .once('receipt', (receipt) => {
          this.setState({ loading: false });
          window.location.reload();  // Recarga la página después de la confirmación
        })
        .on('error', (error) => {
          console.error('Error:', error);
          this.setState({ loading: false });
          window.location.reload();  // Recarga la página incluso si hay un error
        });
    } catch (error) {
      console.error('Error:', error);
      this.setState({ loading: false });
      //window.location.reload();  // Recarga la página incluso si hay un error
    }
  }

  purchaseProduct(id, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price }) //.send({from: this.state.account, gas: 30000000, gasPrice: window.web3.utils.toWai('20','gwei'),type:'0x0'}) //para el server cambiar por eso
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
        window.location.reload();  // Recarga la página después de la confirmación
      });
  }

  createProduct_buyer = (price, energy) => {
    this.state.marketplace.methods.createProduct_buyer(price, energy)
      .send({ from: this.state.account }) //.send({from:this.state.account, gas:3000000, gasPrice: window.web3.utils.toWei('20','gwei'),type:'0x0'})
      .once('receipt', (receipt) => {
        // Refresca la vista o estado
        window.location.reload();
      });
  }

  sellToBuyerRequest = (id, price) => {
    
    this.state.marketplace.methods.sellToBuyerRequest(id)
      .send({ from: this.state.account, value: price }) //.send({from:this.state.account, gas:3000000, gasPrice: window.web3.utils.toWei('20','gwei'),type:'0x0'})
      .once('receipt', (receipt) => {
        window.location.reload();  // Recarga la página después de la confirmación
      });    
  };

  render() {
    return (
      <Router>
        <div>
          <Navbar account={this.state.account} />
          <div className="container-fluid mt-5">
            <div className="row">
              <main role="main" className="col-lg-12 d-flex">
                <Routes>
                  

                  {/* Ruta para HEMS Monitoring */}
                  <Route path="/HEMS" element={<HEMS />} />
                  
                  {/* Ruta para PV System Monitoring */}
                  <Route path="/PV" element={<PVSystem />} />
                  
                  {/* Ruta para SonOff Monitoring */}
                  <Route path="/SmartMeter" element={<DeviceControl />} />


                  {/* Ruta para Marketplace */}
                  <Route
                    path="/"
                    element={
                      this.state.loading
                        ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                        : <Main
                            products={this.state.products}
                            createProduct={this.createProduct}
                            purchaseProduct={this.purchaseProduct}
                            createProduct_buyer={this.createProduct_buyer}
                            products_buyer={this.state.products_buyer}
                            sellToBuyerRequest={this.sellToBuyerRequest}
                          />
                    }
                  />
                </Routes>
              </main>
            </div>
          </div>
          {/* <Main
            products={this.state.products}
            createProduct={this.createProduct}
            purchaseProduct={this.purchaseProduct}
          /> */}
        </div>
      </Router>
    );
  }
}

export default App;
