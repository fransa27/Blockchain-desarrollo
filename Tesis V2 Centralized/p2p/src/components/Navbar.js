import React, { Component } from 'react';
import '../styles/Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faSolarPanel, faCartShopping, faBolt } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <NavLink 
          to="/HEMS"
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <FontAwesomeIcon icon={faHouse} /> Home Monitoring
        </NavLink>

        <NavLink 
          to="/SmartMeter"
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <FontAwesomeIcon icon={faBolt} /> Smart Meter
        </NavLink>

        <NavLink 
          to="/PV"
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <FontAwesomeIcon icon={faSolarPanel} /> PV System Monitoring
        </NavLink>

        <NavLink 
          to="/marketplace"
          className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        >
          <FontAwesomeIcon icon={faCartShopping} /> Energy Market
        </NavLink>

        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          /* href="https://github.com/panxolopez/P2P-SmartGrids" */
          target="_blank"
          rel="noopener noreferrer"
        >
          Peer to Peer Energy Trading in Microgrid
        </a>

        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white">
              <span id="account">Account: {this.props.account}</span>
            </small>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
