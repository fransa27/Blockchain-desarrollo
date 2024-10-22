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
        <h1>Añadir Producto</h1>
        <form onSubmit={(event) => {
          event.preventDefault();
          const name = this.productName.value;
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'ether');
          this.props.createProduct(name, price);
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              ref={(input) => { this.productName = input; }}
              className="form-control"
              placeholder="Nombre del producto"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input; }}
              className="form-control"
              placeholder="Precio en Ether"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Añadir Producto</button>
        </form>
        <p>&nbsp;</p>
        <h2>Comprar Productos</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Propietario</th>
              <th>Comprado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {this.props.products.map((product, key) => {
              return (
                <tr key={key}>
                  <td>{product.id.toString()}</td>
                  <td>{product.name}</td>
                  <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
                  <td>{product.owner}</td>
                  <td>{product.purchased ? "Sí" : "No"}</td>
                  <td>
                    {!product.purchased
                      ? <button
                          className="btn btn-success"
                          name={product.id}
                          value={product.price}
                          onClick={(event) => {
                            this.props.purchaseProduct(event.target.name, event.target.value);
                          }}
                        >
                          Comprar
                        </button>
                      : null
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
