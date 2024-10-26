import React, { Component } from 'react';

class Main extends Component {
  render() {
    return (
      <div id="content">
        <h1>Add Sellers</h1>

        <form className="form-inline" onSubmit={(event) => {
          event.preventDefault();
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'ether');
          this.props.createProduct(price);
          }}>
          <div className="form-group mr-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input; }}
              className="form-control"
              placeholder="Enter price"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Price
          </button>
        </form>
        <br></br>  
        <h2>Sellers</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              
              <th scope="col">Price</th>
              <th scope="col">Energy</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="productList">
            {this.props.products.map((product, key) => {
              return (
                <tr key={key}>
                  <th scope="row">{product.id.toString()}</th>
                  
                  <td>
                    {window.web3.utils.fromWei(product.price.toString(), 'ether')} Eth
                  </td>
                  <td>{product.energy}</td>
                  <td>{product.owner}</td>
                  <td>
                    {!product.purchased ? (
                      <button
                        name={product.id}
                        value={product.price}
                        onClick={(event) => {
                          this.props.purchaseProduct(
                            event.target.name,
                            event.target.value
                          );
                        }}
                      >
                        Buy
                      </button>
                    ) : null}
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