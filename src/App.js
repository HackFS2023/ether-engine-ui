import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './LandingPage';
import UserDashboard from '..components/User/UserDashboard';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/dashboard" component={UserDashboard} />
      </Switch>
    </Router>
  );
};

export default App;