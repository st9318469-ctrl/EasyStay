import React from 'react';
import AuthPage from '../components/AuthPage';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // This component will be handled by AuthPage itself
  // AuthPage already handles login functionality internally
  
  return <AuthPage />;
};

export default Login;