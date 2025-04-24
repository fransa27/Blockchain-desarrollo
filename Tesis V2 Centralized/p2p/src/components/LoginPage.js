// src/components/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleUsuarioClick = () => {
    navigate('/marketplace'); // /usuario
  };

  const handleCoordinadorClick = () => {
    navigate('/coordinator');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Inicio de Sesión</h1>
      <button onClick={handleUsuarioClick} style={{ margin: '10px', padding: '10px 20px' }}>
        Usuario Normal
      </button>
      <button onClick={handleCoordinadorClick} style={{ margin: '10px', padding: '10px 20px' }}>
        Coordinador
      </button>
    </div>
  );
};

export default LoginPage;
