import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import UserNavigationBar from './components/User/UserNavigationBar';
import UserDashboard from './components/User/UserDashboard';
import Profile from './components/User/Profile';
import HelpSupport from './components/User/HelpSupport';
import LandingPage from './components/LandingPage/LandingPage';
import ThreeMaterialXNoise from './components/ThreeMaterialXNoise';

import ProviderNavigationBar from './components/Provider/ProviderNavigationBar';
import ContractManager from './components/Provider/ContractManager';
import DataManager from './components/Provider/DataManager';
import JobManager from './components/Provider/JobManagement';
import JobDiscovery from './components/Provider/JobDiscovery';
import { PolybaseProvider, AuthProvider } from "@polybase/react";
import { Polybase } from "@polybase/client";
import { Auth } from "@polybase/auth"

const polybase = new Polybase({
  defaultNamespace: "pk/0x683b3787f1701bdbd6103b4f78d58a39fa87f7f2676242589556d1927c612e1d6929cba65d25e9b750723d1741a2c41bcc17b849b14f92bd8cf990e7ff298894/EtherEngine",
});
const auth = new Auth();

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
    <PolybaseProvider polybase={polybase}>
      <AuthProvider auth={auth} polybase={polybase}>
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
            <Route path="/providerDashboard" element={<JobDiscovery />} />
            <Route path="/data" element={<DataManager />} />
            <Route path="/jobs" element={<JobManager />} />
            {/* <Route path="/discover" element={<JobDiscovery />} /> */}
          </Routes>
        </div>
        <div className="App">
      <h1>My React App</h1>
      <ThreeMaterialXNoise />
    </div>

      </AuthProvider>
    </PolybaseProvider>
  );
}


export default App;
