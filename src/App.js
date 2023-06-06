import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import UserNavigationBar from './components/User/UserNavigationBar';
import UserDashboard from './components/User/UserDashboard';
import Profile from './components/User/Profile';
import HelpSupport from './components/User/HelpSupport';
import LandingPage from './components/LandingPage/LandingPage';

import ProviderNavigationBar from './components/Provider/ProviderNavigationBar';
import ContractManager from './components/Provider/ContractManager';
import DataManager from './components/Provider/DataManager';
import JobManager from './components/Provider/JobManagement';
import JobDiscovery from './components/Provider/JobDiscovery';

function App() {
  return (
      <Main />
  );
}

function Main() {
  const location = useLocation();
  const userRoutes = ["/dashboard", "/profile", "/help"];
  const isUserRoute = userRoutes.includes(location.pathname);

  return (
    <div>
      {isUserRoute && <UserNavigationBar />}
      {!isUserRoute && location.pathname !== '/' && <ProviderNavigationBar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* User */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<HelpSupport />} />

        {/* StorageProvider/Developer */}
        <Route path="/contracts" element={<ContractManager />} />
        <Route path="/data" element={<DataManager />} />
        <Route path="/jobs" element={<JobManager />} />
        <Route path="/discover" element={<JobDiscovery />} />
      </Routes>
    </div>
  );
}


export default App;
