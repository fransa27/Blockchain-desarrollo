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
import CoordinadorPage from './components/CoordinatorPage';
import LoginPage from './components/LoginPage';

const COORDINATOR = '0x5FA8EEDaCB8D394194c5a125081C090ab658F583'

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  componentDidMount() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
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
    console.log("netID: ", networkId)
    const networkData = Marketplace.networks[networkId];
    //console.log("net: ", networkData)
    if (networkData) {
      const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
      this.setState({ marketplace });

      const productCount = await marketplace.methods.productCount().call();
      this.setState({ productCount });

      const coordinator = await marketplace.methods.coordinator().call();
      this.setState({ coordinator });

      const pendingProducts = await marketplace.methods.getPendingProducts().call();
      this.setState({ pendingProducts });
      console.log("Productos pendientes:", pendingProducts);

      for (let i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call();
        this.setState({
          products: [...this.state.products, product]
        });
      }

      this.setState({ loading: false });
    } else {
      window.alert('Marketplace contract not deployed to detected network.');
    }
    console.log("Productos cargados:", this.state.products);
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true,
      coordinator:'',
      pendingProducts: []
    };

    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
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
      this.state.marketplace.methods.createProduct(energy, price).send({ from: this.state.account })
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
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
        window.location.reload();  // Recarga la página después de la confirmación
      });
  }

  //coordintaro actions
  sellToBuyerRequest = (id, price) => {
    this.state.contract.methods.sellToBuyerRequest(id)
      .send({ from: this.state.account, value: price })
      .once('receipt', () => this.loadBlockchainData());
  }

  async approveProduct(id){
    await this.state.marketplace.methods.approveProduct(id).send({ 
      from: this.state.account 
    });
  }  
  
  async rejectProduct(id) {
    await this.state.marketplace.methods.rejectProduct(id).send({
      from: this.state.account 
    });
  };
  
  async approveBuyerRequest(id){
    await this.state.marketplace.methods.approveBuyerRequest(id).send({ 
      from: this.state.account 
    });
  };
  
  async rejectBuyerRequest(id){
    await this.state.marketplace.methods.rejectBuyerRequest(id).send({ 
      from: this.state.account 
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
                  {/* Ruta para loggearse */}
                  <Route path="/" element={<LoginPage />} />

                  {/* Ruta para HEMS Monitoring */}
                  <Route path="/HEMS" element={<HEMS />} />
                  
                  {/* Ruta para PV System Monitoring */}
                  <Route path="/PV" element={<PVSystem />} />
                  
                  {/* Ruta para SonOff Monitoring */}
                  <Route path="/SmartMeter" element={<DeviceControl />} />

                  {/* Ruta para Coordinator */}
                  <Route path="/coordinator" element={
                    this.state.loading ? (
                      <div className="text-center">Loading...</div>
                    ) : this.state.account.toLowerCase() === COORDINATOR.toLowerCase() ? (
                      <CoordinadorPage
                        products={this.state.products}
                        pendingProducts={this.state.pendingProducts}
                        approveProduct={this.approveProduct}
                        rejectProduct={this.rejectProduct}
                        approveBuyerRequest={this.approveBuyerRequest}
                        rejectBuyerRequest={this.rejectBuyerRequest}
                      />
                    ) : (
                      <div className="text-center">
                        <h2>Access Denied</h2>
                        <p>You are not authorized to view this page.</p>
                      </div>
                    )
                  } />
                  {/* <Route path="/coordinator" element={
                    this.state.account === COORDINATOR : (
                      <CoordinadorPage
                        products={this.state.products}
                        approveProduct={this.approveProduct}
                        rejectProduct={this.rejectProduct}
                        approveBuyerRequest={this.approveBuyerRequest}
                        rejectBuyerRequest={this.rejectBuyerRequest}
                        pendingProducts={this.state.pendingProducts}
                      />
                    )
                  } /> */}

                  {/* Ruta para Marketplace */}
                  <Route
                    path="/marketplace"
                    element={
                      this.state.loading
                        ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                        : <Main
                        createProduct={this.createProduct}
                        createProduct_buyer={this.createProduct_buyer}
                        purchaseProduct={this.purchaseProduct}
                        sellToBuyerRequest={this.sellToBuyerRequest}
                        products={this.state.products}
                        products_buyer={this.state.products_buyer}
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
