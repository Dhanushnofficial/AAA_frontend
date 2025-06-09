// Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Sidebar = ({ logout }) => {
  const [showBillsDropdown, setShowBillsDropdown] = useState(false);

  const toggleBillsDropdown = () => {
    setShowBillsDropdown(prev => !prev);
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <NavLink to="/" end className="sidebar-link">Add New Customers</NavLink>
      <NavLink to="/ViewStart" className="sidebar-link">View All Customers</NavLink>
    
      <NavLink to="/MaterialNoteFrom" className="sidebar-link">Material Note Form</NavLink>
      <NavLink to="/MaterialNote" className="sidebar-link">Material Note Data</NavLink>
      <NavLink to="/MaterialOutwardForm" className="sidebar-link">Material Outward Form</NavLink>
      <NavLink to="/MaterialOutward" className="sidebar-link">Material Outward</NavLink>
      

      <div className="dropdown">
        <div className="sidebar-link dropdown-toggle" onClick={toggleBillsDropdown}>
          Bill Section ▾
        </div>
        {showBillsDropdown && (
          <div className="dropdown-menu">
            <NavLink to="/StartInvoice" className="sidebar-sublink">Start Invoice Bill</NavLink>
            <NavLink to="/UserEstimations" className="sidebar-sublink">Completed Invoice Bill</NavLink>
            <NavLink to="/UserMaterialNotes" className="sidebar-sublink">User Material Bill</NavLink>
            <NavLink to="/MaterialOutwardBill" className="sidebar-sublink">Material Outward Bill</NavLink>
          </div>
        )}
      </div>

      <button onClick={logout} className="sidebar-logout">Logout</button>
    </div>
  );
};

export default Sidebar;
