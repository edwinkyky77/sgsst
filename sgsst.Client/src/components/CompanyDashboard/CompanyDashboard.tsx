import React from 'react';
import styles from './CompanyDashboard.module.css'; // Importa los estilos CSS Module

// Interfaz para los datos de la empresa seleccionada
interface CompanyDataForDashboard {
  idEmpresa: number;
  nombreEmpresa: string;
  nitEmpresa: string;
  logoBase64: string | null;
}

// Props para el componente CompanyDashboard
interface CompanyDashboardProps {
  company: CompanyDataForDashboard; // La empresa seleccionada para mostrar en el dashboard
  onClose: () => void; // Función para cerrar el dashboard y volver a la lista de empresas
  onRegisterEmployee: (companyId: number) => void; // ¡NUEVO! Función para registrar empleado, pasa el ID de la empresa
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ company, onClose, onRegisterEmployee }) => {
  // Array de objetos para definir los botones del dashboard
  const dashboardButtons = [
    // ¡CAMBIO AQUÍ! Llama a onRegisterEmployee con el idEmpresa
    { name: 'Registro de Empleados', imageClass: styles.btnEmployees, action: () => onRegisterEmployee(company.idEmpresa) },
    { name: 'EPP', imageClass: styles.btnEpp, action: () => console.log(`Ir a EPP de ${company.nombreEmpresa}`) },
    { name: 'TSA', imageClass: styles.btnTsa, action: () => console.log(`Ir a TSA de ${company.nombreEmpresa}`) },
    { name: 'Fotografía', imageClass: styles.btnPhotography, action: () => console.log(`Ir a Fotografía de ${company.nombreEmpresa}`) },
    { name: 'Informes', imageClass: styles.btnReports, action: () => console.log(`Ir a Informes de ${company.nombreEmpresa}`) },
    { name: 'Inspecciones', imageClass: styles.btnInspections, action: () => console.log(`Ir a Inspecciones de ${company.nombreEmpresa}`) },
    { name: 'Historial', imageClass: styles.btnHistory, action: () => console.log(`Ir a Historial de ${company.nombreEmpresa}`) },
    { name: 'Charlas', imageClass: styles.btnTalks, action: () => console.log(`Ir a Charlas de ${company.nombreEmpresa}`) },
    { name: 'Otros Formatos', imageClass: styles.btnOtherFormats, action: () => console.log(`Ir a Otros Formatos de ${company.nombreEmpresa}`) },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.companyHeader}>
        <div className={styles.logoContainer}>
          {company.logoBase64 ? (
            <img 
              src={`data:image/png;base64,${company.logoBase64}`} 
              alt={`Logo de ${company.nombreEmpresa}`} 
              className={styles.companyLogo} 
              onError={(e) => { 
                e.currentTarget.onerror = null; 
                e.currentTarget.src = 'https://placehold.co/120x120/cccccc/333333?text=No+Logo'; 
              }}
            />
          ) : (
            <div className={styles.noLogoPlaceholder}>
              <span>{company.nombreEmpresa.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <h2 className={styles.companyNameTitle}>{company.nombreEmpresa}</h2>
        <p className={styles.companyNitTitle}>NIT: {company.nitEmpresa}</p>
      </div>

      <div className={styles.dashboardGrid}>
        {dashboardButtons.map((button, index) => (
          <button 
            key={index} 
            className={`${styles.dashboardButton} ${button.imageClass}`} 
            onClick={button.action}
          >
            <span>{button.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <button className="btn waves-effect waves-light grey darken-1" onClick={onClose}>
          Volver a Empresas
          <i className="material-icons right">arrow_back</i>
        </button>
      </div>
    </div>
  );
};

export default CompanyDashboard;
