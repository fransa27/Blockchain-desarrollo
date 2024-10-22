import React, { Component } from 'react';
import Web3 from 'web3';

class Main extends Component {
  async componentDidMount() {
    // Verifica si web3 está inyectado (por ejemplo, por MetaMask)
    if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
      // Utiliza el Web3 actual inyectado por MetaMask u otro proveedor
      const web3 = new Web3(window.ethereum || window.web3.currentProvider);
      window.web3 = web3;
    } else {
      console.error("No web3 provider found. Please install MetaMask or another provider.");
    }

    if (window.ethereum) {
        try {
          // Pide al usuario que conecte MetaMask
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          window.web3 = web3;
        } catch (error) {
          console.error("User denied account access", error);
        }
      } else if (window.web3) {
        const web3 = new Web3(window.web3.currentProvider);
        window.web3 = web3;
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
  }


  render() {
    return (
      <div id="content">
        <h1>Add Product</h1>
        <form onSubmit={(event) => {
          event.preventDefault();
          const name = this.productName.value;
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether'); // Asegúrate de que web3 está disponible
          this.props.createProduct(name, price);
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              ref={(input) => { this.productName = input }}
              className="form-control"
              placeholder="Product Name"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input }}
              className="form-control"
              placeholder="Product Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Product</button>
        </form>
        <p>&nbsp;</p>
        <h2>Buy Product</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="productList">
            <tr>
              <th scope="row">1</th>
              <td>iPhone X</td>
              <td>1 Eth</td>
              <td>0x39C7BC5496f4eaaa1fF75d88E079C22f0519E7b9</td>
              <td><button className="buyButton">Buy</button></td>
            </tr>
            {/* Más productos... */}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
