import React from 'react';
import { Link } from 'react-router-dom';

import '../../App.css'; // Make sure to import your CSS file

const ProviderNavigationBar = () => {
  return (
    <nav>
      <ul>
        {/* <li><Link to="/providerDashboard">Dashboard</Link></li> */}
        {/* <li><Link to="/contracts">Contracts</Link></li> */}
        {/* <li><Link to="/data">Data Management</Link></li> */}
        {/* <li><Link to="/jobs">Job Management</Link></li> */}
        <li><Link to="/providerDashboard"  className="nav-link">Job Discovery</Link></li>
        {/* <li><Link to="/logout">Logout</Link></li> */}
      </ul>
    </nav>
  );
};

export default ProviderNavigationBar;
