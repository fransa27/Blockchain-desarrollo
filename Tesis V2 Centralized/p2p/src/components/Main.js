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

    console.log("productos para comprar: ", this.props.products)

  }


  render() {
    return (
      <div id="content">
        <h1>Sell Energy</h1>
        <form onSubmit={(event) => {
          event.preventDefault();
          const energy = this.productEnergy.value;
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'ether');
          this.props.createProduct(price, energy);
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="productEnergy"
              type="text"
              ref={(input) => { this.productEnergy = input; }}
              className="form-control"
              placeholder="Amount of energy in Watts"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input; }}
              className="form-control"
              placeholder="Price in Ether"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Product</button>
        </form>
    
        <h1>Request Power Purchase</h1>
        <form onSubmit={(event) => {
          event.preventDefault();
          const buyerEnergy = this.buyerEnergy.value;
          const buyerPrice = window.web3.utils.toWei(this.buyerPrice.value.toString(), 'ether');
          this.props.createProduct_buyer(buyerPrice, buyerEnergy);
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="buyerEnergy"
              type="text"
              ref={(input) => { this.buyerEnergy = input; }}
              className="form-control"
              placeholder="Amount of energy in Watts"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="buyerPrice"
              type="text"
              ref={(input) => { this.buyerPrice = input; }}
              className="form-control"
              placeholder="Price you are willing to pay (Ether)"
              required />
          </div>
          <button type="submit" className="btn btn-warning">Post Request</button>
        </form>
    
        <div>
          <h1>Offers List</h1>
          <p>&nbsp;</p>
          <h2>Buy Energy</h2>
          <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount of Energy</th>
                  <th>Price</th>
                  <th>Owner</th>
                  <th>Purchased</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                { this.props.products && Array.isArray(this.props.products) ? (
                this.props.products.map((product, key) => (
                  <tr key={key}>
                    <td>{product.id.toString()}</td>
                    <td>{product.energy}</td>
                    <td>{window.web3.utils.fromWei(product.price.toString(), 'ether')} Eth</td>
                    <td>{product.owner}</td>
                    <td>{product.purchased ? "Yes" : "No"}</td>
                    <td>
                      {!product.purchased ? (
                        <button
                          className="btn btn-success"
                          name={product.id}
                          value={product.price}
                          onClick={async (event) => {
                            event.preventDefault();
                            // Verifica si el producto fue aprobado por el coordinador
                            if (product.approvalStatus !== 'Approved') {
                              alert("This offer has not yet been approved by the Coordinator. Please wait for approval before attempting to purchase.");
                              return;
                            }

                            try {
                              await this.props.purchaseProduct(event.target.name, event.target.value);
                            } catch (error) {
                              console.error("Transaction failed:", error);
                              alert("An error occurred while trying to purchase. Check that you have enough balance or try again.");
                            }
                          }}
                        >
                          Buy
                        </button>
                      ) : null}

                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="6">Loading products or none available.</td>
                  </tr>
                )
                }
              </tbody>
            </table>
        
            <p>&nbsp;</p>
            <h2>Purchase Requests</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount of Energy</th>
                  <th>Price</th>
                  <th>Requester</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.props.products_buyer && Array.isArray(this.props.products_buyer) ? (
                  this.props.products_buyer.map((request, key) => {
                  return (
                    <tr key={key}>
                      <td>{request.id}</td>
                      <td>{request.energy}</td>
                      <td>{window.web3.utils.fromWei(request.price.toString(), 'ether')} Eth</td>
                      <td>{request.owner}</td>
                      <td>
                        {
                          !request.fulfilled ? (
                            <button
                              className="btn btn-primary"
                              onClick={async (event) =>{
                                event.preventDefault();

                                if (request.approvalStatus !== 'Approved') {
                                  alert("This request has not yet been approved by the Coordinator.");
                                  return;
                                }

                                try {
                                  await this.props.sellToBuyerRequest(request.id);
                                } catch (error) {
                                  console.error("Transaction failed:", error);
                                  alert("Error when trying to sell. Check that you have permissions and sufficient balance.");
                                }
                              }}
                            >
                              Sell Energy
                            </button>
                          ) : null
                        }
                      </td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td colSpan="5">Loading purchase requests or none available.</td>
                  </tr>
                )
              }
              </tbody>
            </table>
        </div>

      </div>
    );
  }
}

export default Main;
