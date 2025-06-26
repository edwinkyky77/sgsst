import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Tus estilos globales si los tienes

// Importar Materialize CSS
import 'materialize-css/dist/css/materialize.min.css';
import M from 'materialize-css'; // Importar el objeto M de Materialize para JavaScript

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Inicializar componentes de Materialize después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit(); // Inicializa todos los componentes de Materialize con data-attributes
});