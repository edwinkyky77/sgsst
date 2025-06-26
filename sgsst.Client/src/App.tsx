// sgsst.Client/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginForm from './components/LoginForm/LoginForm';
import RegistroDeEmpresa from './components/RegistroDeEmpresa/RegistroDeEmpresa';

import './App.css';
import M from 'materialize-css';
// import logo from './assets/logo.jpg'; // <--- ¡ELIMINA ESTA IMPORTACIÓN!

const MainLayout: React.FC = () => {
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#001f3f');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  useEffect(() => {
    M.AutoInit();
  }, []);

  useEffect(() => {
    const appContainer = document.getElementById('app-background-container');
    if (appContainer) {
      if (backgroundType === 'color') {
        appContainer.style.background = backgroundColor;
        appContainer.style.backgroundImage = 'none';
      } else if (backgroundType === 'image' && backgroundImage) {
        appContainer.style.background = `url(${backgroundImage}) no-repeat center center fixed`;
        appContainer.style.backgroundSize = 'cover';
      } else {
        appContainer.style.background = '#001f3f';
        appContainer.style.backgroundImage = 'none';
      }
    }
  }, [backgroundType, backgroundColor, backgroundImage]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
    setBackgroundType('color');
    setBackgroundImage('');
  };

  const handleApplyImage = () => {
    if (tempImageUrl) {
      setBackgroundImage(tempImageUrl);
      setBackgroundType('image');
      setBackgroundColor('');
    } else {
      alert('Por favor, ingresa una URL de imagen válida.');
    }
  };

  const handleRestoreDefault = () => {
    setBackgroundType('color');
    setBackgroundColor('#001f3f');
    setBackgroundImage('');
    setTempImageUrl('');
  };

  const toggleCustomizer = () => {
    setIsCustomizerOpen(!isCustomizerOpen);
  };

  return (
    <div id="app-background-container" className="app-container">
      {/* <img src={logo} alt="Logo de la empresa" className="app-logo" /> */} {/* <--- ¡ELIMINA ESTA LÍNEA! */}

      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/registro-empresa" element={<RegistroDeEmpresa />} />
      </Routes>

      {/* Panel de Personalización de Fondo (se mantiene) */}
      <div className={`card background-customizer ${isCustomizerOpen ? 'open' : 'closed'}`}>
        <div className="customizer-toggle-button" onClick={toggleCustomizer} title="Personalizar fondo">
          <i className="material-icons">{isCustomizerOpen ? 'close' : 'palette'}</i>
        </div>

        <div className="customizer-content">
          <div className="card-content">
            <span className="card-title customizer-card-title">Personalizar Fondo</span>

            <div className="input-field customizer-input-field mt-10-custom">
              <label htmlFor="backgroundColorPicker">Color de Fondo</label>
              <input
                type="color"
                id="backgroundColorPicker"
                value={backgroundColor}
                onChange={handleColorChange}
                title="Seleccionar el color de fondo"
                className="color-picker-input-custom"
              />
            </div>

            <div className="input-field customizer-input-field mt-20-custom">
              <input
                id="backgroundImageUrl"
                type="text"
                placeholder="Ej: https://picsum.photos/1920/1080"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
                className="validate"
                title="Ingresar la URL de la imagen de fondo"
              />
              <label htmlFor="backgroundImageUrl">URL de Imagen</label>
            </div>

            <button
              className="btn waves-effect waves-light blue darken-1 mr-10-custom"
              onClick={handleApplyImage}
              title="Aplicar la imagen como fondo"
            >
              Aplicar Imagen
            </button>
            <button
              className="btn waves-effect waves-light grey darken-1"
              onClick={handleRestoreDefault}
              title="Restaurar el fondo a su color predeterminado"
            >
              Restaurar Predeterminado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;