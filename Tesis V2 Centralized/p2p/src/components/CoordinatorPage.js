// src/components/CoordinadorPage.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoordinadorPage = ({ products, approveProduct, rejectProduct, approveBuyerRequest, rejectBuyerRequest, pendingProducts }) => {
  const [chartData, setChartData] = useState({});
  const [chartDataH2, setChartDataH2] = useState({});
  const navigate = useNavigate();

  const handleBackClick = () => navigate('/');

  /* console.log(products)
  console.log(approveProduct)
  console.log(rejectProduct)
  console.log( approveBuyerRequest)
  console.log( rejectBuyerRequest) */

  useEffect(() => {
    const fetchThingSpeakData = async (field, setter) => {
      try {
        const response = await axios.get(`https://api.thingspeak.com/channels/2448826/fields/${field}.json?api_key=X3ER4G02F52IQTSU&results=50`);
        const data = response.data.feeds;
        if (data && data.length > 0) {
          const timestamps = data.map(feed => feed.created_at).reverse();
          const values = data.map(feed => parseFloat(feed[`field${field}`]) || 0).reverse();
          setter({
            labels: timestamps,
            datasets: [{
              label: field === 1 ? 'House 1 Power' : 'House 2 Power',
              data: values,
              borderColor: field === 1 ? 'rgba(75,192,192,1)' : 'rgb(75, 192, 91)',
              fill: false,
            }],
          });
        }
      } catch (error) {
        console.error(`Error fetching data for field ${field}:`, error);
      }
    };

    fetchThingSpeakData(1, setChartData);
    fetchThingSpeakData(2, setChartDataH2);
  }, []);

  const pendingSales = products.filter(p => p.approvalStatus === '0' && !p.purchased);
  const pendingPurchases = products.filter(p => p.approvalStatus === '0' && p.purchased);

  return (
    <div className="container mt-4 text-center">
      <h1>Coordinator Panel</h1>

      {/* VENTAS PENDIENTES */}
      <div className="card-body p-2 mb-4" style={{ backgroundColor: '#23cd05', maxHeight: '300px', overflowY: 'auto' }}>
        <h3>Products for Sale (Pending Approval)</h3>
        <table className="table table-sm table-bordered bg-white">
          <thead className="thead-light">
            <tr>
              <th>ID</th>
              <th>Energy</th>
              <th>Price (ETH)</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingSales.map((product, key) => ( //era pendingSales
              <tr key={key}>
                <td>{product.id}</td>
                <td>{product.energy}</td>
                <td>{window.web3.utils.fromWei(product.price.toString(), 'ether')}</td>
                <td>{product.owner}</td>
                <td><span className="badge badge-warning">Pending</span></td>
                <td>
                  <button className="btn btn-success btn-sm mr-2" onClick={() => approveProduct(product.id)}>Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => rejectProduct(product.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COMPRAS PENDIENTES */}
      <div className="card-body p-2 mb-4" style={{ backgroundColor: '#c1cd05', maxHeight: '300px', overflowY: 'auto' }}>
        <h3>Purchase Requests (Pending Approval)</h3>
        <table className="table table-sm table-bordered bg-white">
          <thead className="thead-light">
            <tr>
              <th>ID</th>
              <th>Energy</th>
              <th>Price (ETH)</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPurchases.map((request, key) => (
              <tr key={key}>
                <td>{request.id}</td>
                <td>{request.energy}</td>
                <td>{window.web3.utils.fromWei(request.price.toString(), 'ether')}</td>
                <td>{request.owner}</td>
                <td><span className="badge badge-warning">Pending</span></td>
                <td>
                  <button className="btn btn-success btn-sm mr-2" onClick={() => approveBuyerRequest(request.id)}>Approve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => rejectBuyerRequest(request.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GRÁFICOS */}
      <h2>Monitoring Houses</h2>
      <div>
        <p>House 1</p>
        <div style={{ width: '60rem', height: '20rem', margin: 'auto' }}>
          {chartData.labels ? <Line data={chartData} /> : <p>Loading data...</p>}
        </div>

        <p>House 2</p>
        <div style={{ width: '60rem', height: '20rem', margin: 'auto' }}>
          {chartDataH2.labels ? <Line data={chartDataH2} /> : <p>Loading data...</p>}
        </div>
      </div>

      <button onClick={handleBackClick} className="btn btn-outline-secondary mt-3">Back</button>
    </div>
  );
};

export default CoordinadorPage;
