import React, { useEffect, useState } from 'react';
import M from 'materialize-css'; 
import './RegistroDeEmpresa.css';
import FactoryForm from './FactoryForm'; 
import CompanyList from '../CompanyList/CompanyList'; 
import CompanyDashboard from '../CompanyDashboard/CompanyDashboard'; 
import EmployeeRegistrationForm from '../EmployeeRegistrationForm/EmployeeRegistrationForm'; // ¡NUEVO! Importa el componente de registro de empleados

// Definición de tipos para la estructura de los datos del JSON (sin cambios)
interface MonthData { 
  [day: string]: string[]; 
}

interface CelebrationsData { 
  [month: string]: MonthData; 
}

// Define la interfaz FormData (para el formulario de registro de empresa)
interface FormData {
  nombreEmpresa: string;
  nitEmpresa: string;
  direccionEmpresa: string;
  telefonoEmpresa: string;
  email: string;
  logo: string | null; 
  contactoGerente: string; 
  departamento: string;
  municipio: string;
  nombreGerente: string;
  nombreProyecto: string;
  direccionProyecto: string;
  sisoJefe: string;
  EmpresaCol: string;
}

// Define la interfaz para los datos de una empresa para la lista y el dashboard
interface CompanyDataForList {
  idEmpresa: number;
  nombreEmpresa: string;
  nitEmpresa: string;
  logoBase64: string | null; 
}

const monthNames: { [key: number]: string } = {
  0: 'enero', 1: 'febrero', 2: 'marzo', 3: 'abril', 4: 'mayo', 5: 'junio',
  6: 'julio', 7: 'agosto', 8: 'septiembre', 9: 'octubre', 10: 'noviembre', 11: 'diciembre'
};

const RegistroDeEmpresa: React.FC = () => { 
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [dailyCelebrations, setDailyCelebrations] = useState<string[]>([]);
  const [celebrationsData, setCelebrationsData] = useState<CelebrationsData | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null);
  
  // Estado para la lista de empresas obtenida del backend
  const [companiesList, setCompaniesList] = useState<CompanyDataForList[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [errorLoadingCompanies, setErrorLoadingCompanies] = useState<string | null>(null);

  // Estado para el contador real de empresas registradas
  const [companiesRegisteredCount, setCompaniesRegisteredCount] = useState<number>(0);

  // Estados para controlar la vista y la empresa seleccionada
  const [currentView, setCurrentView] = useState<'buttons' | 'form' | 'list' | 'dashboard' | 'employeeForm'>('buttons'); // ¡NUEVO ESTADO: 'employeeForm'!
  const [selectedCompany, setSelectedCompany] = useState<CompanyDataForList | null>(null);
  const [employeeRegistrationCompanyId, setEmployeeRegistrationCompanyId] = useState<number | null>(null); // ¡NUEVO! Para pasar el ID de la empresa al formulario de empleado

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json'); 
        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
        const data: CelebrationsData = await response.json(); 
        setCelebrationsData(data);
      } catch (error: unknown) { 
        console.error("Error al cargar data.json:", error);
        setErrorLoadingData("No se pudieron cargar los datos de celebraciones.");
      } finally { setLoadingData(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loadingData && !errorLoadingData && celebrationsData) {
      const updateDateTimeAndCelebrations = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }; 
        setCurrentDateTime(now.toLocaleDateString('es-ES', options));
        const monthIndex = now.getMonth();
        const day = now.getDate().toString();
        const monthName = monthNames[monthIndex];
        if (celebrationsData[monthName] && celebrationsData[monthName][day]) {
          setDailyCelebrations(celebrationsData[monthName][day]);
        } else {
          setDailyCelebrations(['No hay celebraciones conocidas para hoy.']);
        }
      };
      updateDateTimeAndCelebrations();
      const intervalId = setInterval(updateDateTimeAndCelebrations, 1000);
      return () => clearInterval(intervalId);
    }
  }, [loadingData, errorLoadingData, celebrationsData]);

  const handleSaveFormData = async (formData: FormData) => { 
    console.log("Intentando guardar datos al backend:", formData);
    try {
      const response = await fetch('https://localhost:7266/api/Empresas/register_company', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error HTTP: ${response.status}`);
      }

      console.log("Respuesta del backend:", result);
      return result; 
    } catch (error: unknown) { 
      console.error("Error en la petición al backend:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Error de conexión al servidor.");
      } else {
        throw new Error("Error desconocido al registrar la empresa. Intente más tarde.");
      }
    }
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    setErrorLoadingCompanies(null);
    try {
      const response = await fetch('https://localhost:7266/api/Empresas'); 
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data: CompanyDataForList[] = await response.json();
      setCompaniesList(data);
      setCompaniesRegisteredCount(data.length); 
      console.log("Empresas cargadas:", data);
    } catch (error: unknown) {
      console.error("Error al cargar las empresas:", error);
      if (error instanceof Error) {
        setErrorLoadingCompanies(error.message || "Error al cargar las empresas.");
      } else {
        setErrorLoadingCompanies("Error desconocido al cargar las empresas.");
      }
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Manejadores de clic para los botones
  const handleRegisterButtonClick = () => {
    console.log("Botón 'Registrar Empresa' clickeado. Abriendo FactoryForm.");
    setCurrentView('form'); 
  };

  const handleViewCompaniesClick = async () => {
    console.log("Botón 'Ver Empresas Registradas' clickeado. Cargando lista...");
    setCurrentView('list'); 
    await fetchCompanies(); 
  };

  // Maneja la selección de una empresa de la lista
  const handleSelectCompany = (company: CompanyDataForList) => {
    console.log("Empresa seleccionada:", company.nombreEmpresa);
    setSelectedCompany(company); // Guarda la empresa seleccionada en el estado
    setCurrentView('dashboard'); // Cambia la vista al dashboard
  };

  // ¡NUEVA FUNCIÓN! Maneja el clic en "Registro de Empleados" desde el dashboard
  const handleRegisterEmployeeClick = (companyId: number) => {
    console.log(`Abriendo formulario de registro de empleados para la empresa ID: ${companyId}`);
    setEmployeeRegistrationCompanyId(companyId); // Guarda el ID de la empresa
    setCurrentView('employeeForm'); // Cambia la vista al formulario de empleado
  };

  const handleCloseFactoryForm = () => {
    setCurrentView('buttons'); 
    fetchCompanies(); 
  };

  const handleCloseCompanyList = () => {
    setCurrentView('buttons'); 
  };

  // Para cerrar el dashboard y volver a la lista de empresas
  const handleCloseDashboard = () => {
    setSelectedCompany(null); // Limpia la empresa seleccionada
    setCurrentView('list'); // Vuelve a la vista de la lista de empresas
  };

  // ¡NUEVA FUNCIÓN! Para cerrar el formulario de registro de empleado
  const handleCloseEmployeeForm = () => {
    setEmployeeRegistrationCompanyId(null); // Limpia el ID de la empresa
    setCurrentView('dashboard'); // Vuelve al dashboard de la empresa
  };

  const handleSuccessMessage = (message: string) => { 
    M.toast({ html: message, classes: 'green darken-1' });
    setCurrentView('buttons'); 
    fetchCompanies(); 
  };

  const handleErrorMessage = (message: string) => { 
    M.toast({ html: message, classes: 'red darken-1' });
  };

  // Efecto para cargar el contador inicial de empresas al montar el componente
  useEffect(() => {
    fetchCompanies();
  }, []);


  return (
    <div className="container">
      <header className="header">
        <h1>Diana's SGSST</h1>
      </header>

      <aside className="sidebar left-sidebar">
        <h2>Enlaces SGSST Nacional</h2>
        <ul>
          <li><a href="https://www.minsalud.gov.co/salud/publica/Pags/Sistema-General-de-Riesgos-Laborales.aspx" target="_blank" rel="noopener noreferrer">Ministerio de Salud - SGSST</a></li>
          <li><a href="https://www.mintrabajo.gov.co/web/guest/empleo-y-pensiones/riesgos-laborales/seguridad-y-salud-en-el-trabajo" target="_blank" rel="noopener noreferrer">Ministerio del Trabajo - SGSST</a></li>
          <li><a href="https://www.arlsura.com/index.php/component/content/article/105-noticias/2293-seguridad-y-salud-en-el-trabajo" target="_blank" rel="noopener noreferrer">ARL Sura - Información SGSST</a></li>
        </ul>
      </aside>

      <main className="main-content">
        <h2>Contenido Principal de la Página</h2>
        <p>Aquí puedes agregar el contenido central de tu aplicación, como formularios de registro, dashboards, información relevante de la empresa, etc.</p>
        <p>Este es un espacio flexible para los elementos más importantes de tu interfaz, siguiendo el estilo **OnePage**.</p>
        {loadingData && <p>Cargando datos de celebraciones...</p>}
        {errorLoadingData && <p className="error-message">Error: {errorLoadingData}</p>}

        {/* Renderizado condicional del contenido principal basado en 'currentView' */}
        {currentView === 'buttons' && (
          <>
            <div className="button-container">
              <button className="action-button left-button" onClick={handleRegisterButtonClick}>
                <span>Registrar Empresa</span>
              </button>
              <button
                className={`action-button right-button ${companiesRegisteredCount === 0 && !loadingCompanies ? 'disabled' : ''}`}
                onClick={handleViewCompaniesClick}
                disabled={loadingCompanies} 
              >
                <span>Ver Empresas Registradas</span>
              </button>
            </div>
            <p style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: '#555'}}>
              Empresas registradas (real): {companiesRegisteredCount}
            </p>
          </>
        )}

        {currentView === 'form' && (
          <div className={`factoryFormOverlayWrapper ${currentView === 'form' ? 'show' : ''}`}>
            <FactoryForm 
              showFactoryForm={true} 
              onClose={handleCloseFactoryForm}   
              onSave={handleSaveFormData}       
              onSuccess={handleSuccessMessage} 
              onError={handleErrorMessage} 
            />
          </div>
        )}

        {currentView === 'list' && (
          <div className="companyListWrapper">
            {loadingCompanies ? (
              <p className="center-align">Cargando empresas...</p>
            ) : errorLoadingCompanies ? (
              <p className="red-text center-align">Error: {errorLoadingCompanies}</p>
            ) : (
              <CompanyList companies={companiesList} onClose={handleCloseCompanyList} onSelectCompany={handleSelectCompany} />
            )}
          </div>
        )}

        {currentView === 'dashboard' && selectedCompany && (
          <div className="companyDashboardWrapper">
            <CompanyDashboard 
              company={selectedCompany} 
              onClose={handleCloseDashboard} 
              onRegisterEmployee={handleRegisterEmployeeClick} // ¡Pasa la nueva función!
            />
          </div>
        )}

        {/* ¡NUEVO! Renderiza el formulario de registro de empleado */}
        {currentView === 'employeeForm' && employeeRegistrationCompanyId !== null && (
          <div className="employeeFormWrapper"> {/* Puedes aplicar estilos aquí si es necesario */}
            <EmployeeRegistrationForm 
              companyId={employeeRegistrationCompanyId} 
              onClose={handleCloseEmployeeForm} 
            />
          </div>
        )}
      </main>

      <aside className="sidebar right-sidebar">
        <h2>Más Enlaces SGSST</h2>
        <ul>
          <li><a href="https://www.secretariasenado.gov.co/index.php/leyes-por-tema/seguridad-y-salud-en-el-trabajo" target="_blank" rel="noopener noreferrer">Leyes SGSST (Senado)</a></li>
          <li><a href="https://legal.legis.com.co/Document/VerDocumento?id=LEGIS_214539&tipodoc=CP" target="_blank" rel="noopener noreferrer">Normativa SGSST (Legis)</a></li>
          <li><a href="https://www.ilo.org/global/topics/safety-and-health-at-work/lang--es/index.htm" target="_blank" rel="noopener noreferrer">OIT - Seguridad y Salud</a></li>
        </ul>
      </aside>

      <footer className="footer">
        <div className="celebration-info">
          <span>Hoy, {currentDateTime}:</span>
          <br />
          {loadingData ? (
            <span>Cargando celebraciones...</span>
          ) : errorLoadingData ? (
            <span className="error-message">Error al cargar celebraciones.</span>
          ) : (
            dailyCelebrations.map((celebration, index) => (
              <span key={index}>{celebration}</span>
            ))
          )}
        </div>
      </footer>
    </div>
  );
};

export default RegistroDeEmpresa;
