import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
  const [computations, setComputations] = useState(null);

  useEffect(() => {
    // Replace with your own API endpoint
    fetch('/api/computations')
      .then(response => response.json())
      .then(data => setComputations(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <h2>Requested Computations</h2>
        {/* Display requested computations */}
        {computations && computations.requested.map(comp => <div key={comp.id}>{comp.name}</div>)}
      </div>
      <div>
        <h2>Completed Computations</h2>
        {/* Display completed computations */}
        {computations && computations.completed.map(comp => <div key={comp.id}>{comp.name}</div>)}
      </div>
      <div>
        <h2>New Request</h2>
        {/* Form to submit a new computation request */}
      </div>
    </div>
  );
};

export default UserDashboard;
