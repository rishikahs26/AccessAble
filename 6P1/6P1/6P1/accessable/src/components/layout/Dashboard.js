import React from 'react';

const Dashboard = ({ children }) => (
  <div className="max-w-md mx-auto min-h-screen flex flex-col space-y-6 p-6">
    {children}
  </div>
);

export default Dashboard;
