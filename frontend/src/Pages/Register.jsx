import React from 'react';
import AuthPage from '../components/AuthPage';

const Register = () => {
  // AuthPage handles both login and signup with its internal state
  // We just need to render AuthPage which already has the tab switcher
  
  return <AuthPage />;
};

export default Register;
