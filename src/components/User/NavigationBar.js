import React from 'react';

const NavigationBar = () => {
  return (
    <nav>
      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/profile">Profile</a></li>
        <li><a href="/help">Help & Support</a></li>
        <li><a href="/logout">Logout</a></li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
