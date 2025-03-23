import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Layout.css';

function SideMenu() {
  return (
    <aside className="sidemenu">
      <div className="sidemenu-container">
        <ul className="sidemenu-list">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">
                <i className="fas fa-tachometer-alt"></i>
              </span>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li className="menu-label">Transactions</li>
          <li>
            <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">
                <i className="fas fa-list"></i>
              </span>
              <span>All Transactions</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/transactions/new" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>Add Transaction</span>
            </NavLink>
          </li>
          
          <li className="menu-label">Households</li>
          <li>
            <NavLink to="/households" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">
                <i className="fas fa-home"></i>
              </span>
              <span>My Households</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/households/new" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon">
                <i className="fas fa-plus-circle"></i>
              </span>
              <span>Create Household</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default SideMenu;