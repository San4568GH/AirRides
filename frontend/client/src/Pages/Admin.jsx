
import React from 'react';
import { Link } from 'react-router-dom';

function AdminPage() {
  return (
    <div>
      <h1>Welcome to the Admin Panel</h1>
      <Link to="/admin/add-cities">
        <button>Add Cities</button>
      </Link>
    
      <Link to="/admin/add-flight">
        <button>Add Flights</button>
      </Link>
    </div>
  );
};

export default AdminPage
