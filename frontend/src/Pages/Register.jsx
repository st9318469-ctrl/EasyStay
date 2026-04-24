import React from 'react';
import AuthPage from '../components/AuthPage';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  // AuthPage handles both login and signup with its internal state
  // We just need to render AuthPage which already has the tab switcher
  
  return <AuthPage />;
};

export default Register;