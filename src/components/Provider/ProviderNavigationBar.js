import React from 'react';
import { Link } from 'react-router-dom';

const ProviderNavigationBar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/providerDashboard">Dashboard</Link></li>
        <li><Link to="/contracts">Contracts</Link></li>
        <li><Link to="/data">Data Management</Link></li>
        <li><Link to="/jobs">Job Management</Link></li>
        <li><Link to="/discover">Job Discovery</Link></li>
        <li><Link to="/logout">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default ProviderNavigationBar;
