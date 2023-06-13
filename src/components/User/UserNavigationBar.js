import React from 'react';

import '../../App.css'; // Make sure to import your CSS file


const UserNavigationBar = () => {
  return (
    <nav>
      <ul>
        <li><a href="/dashboard" className="nav-link">Dashboard</a></li>
        <li><a href="/profile" className="nav-link">Profile</a></li>
        <li><a href="/help" className="nav-link">Help & Support</a></li>
        {/* <li><a href="/logout" className="nav-link">Logout</a></li> */}
      </ul>
    </nav>
  );
};


export default UserNavigationBar;
