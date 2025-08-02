// src/components/LoginForm/LoginForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import M from 'materialize-css';
import 'material-icons/iconfont/material-icons.css';

// ¡IMPORTA TU LOGO AQUÍ! Asegúrate de que la ruta sea correcta desde este archivo.
import logo from '../../assets/logo.jpg'; // <-- ¡AÑADE ESTA IMPORTACIÓN! (La ruta puede variar si tu carpeta 'assets' está en otro lugar)

import WelcomeModal from '../RegistroDeEmpresa/WelcomeModal';

interface LoginResponse {
  token: string;
  alias: string;
  userType: string;
  expiration: string;
  message: string;
}

const LoginForm: React.FC = () => {
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loggedInAlias, setLoggedInAlias] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    M.updateTextFields();
  }, [alias, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Submitted!');

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('https://localhost:7266/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alias, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.Message || 'Credenciales inválidas o error desconocido del servidor.');
        console.error('Login failed:', response.status, errorData);
        setLoading(false);
        return;
      }

      const data: LoginResponse = await response.json();
      console.log('Login successful:', data);

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userAlias', data.alias);
      localStorage.setItem('userType', data.userType);

      setLoggedInAlias(data.alias);
      setShowModal(true);

    } catch (err) {
      console.error('Network or unexpected error during login:', err);
      setError('Error de conexión o problema inesperado. Asegúrate que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/registro-empresa');
  };

  return (
    <div className={styles['login-container']}>
      {/* ¡NUEVO ELEMENTO PARA EL LOGO AQUÍ! Solo se verá en el LoginForm */}
      <img src={logo} alt="Logo de la empresa" className="app-logo" style={{ marginBottom: '20px' }} /> {/* Puedes ajustar el estilo */}

      <div className={styles['login-form-card']}>
        <div className="card-content">
          <span className={styles['card-title']}>Diana's SGSST</span>
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

            <div className="row">
              <div className="input-field col s12">
                <i className="material-icons prefix">person</i>
                <input
                  id="icon_prefix_user"
                  type="text"
                  className="validate"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  required
                />
                <label htmlFor="icon_prefix_user">Usuario</label>
              </div>
              <div className="input-field col s12">
                <i className="material-icons prefix">lock</i>
                <input
                  id="icon_prefix_password"
                  type="password"
                  className="validate"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="icon_prefix_password">Contraseña</label>
              </div>
            </div>
            <div className="card-action">
              <button
                className="btn waves-effect waves-light"
                type="submit"
                name="action"
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'INICIAR SESIÓN'}
                <i className="material-icons right">send</i>
              </button>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
          </form>
        </div>
      </div>

      <WelcomeModal
        isOpen={showModal}
        onClose={handleModalClose}
        userName={loggedInAlias}
      />
    </div>
  );
};

export default LoginForm;