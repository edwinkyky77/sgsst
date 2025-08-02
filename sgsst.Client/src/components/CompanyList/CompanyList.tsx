import React from 'react';
import styles from './CompanyList.module.css'; // Importa los estilos CSS Module

// Define la interfaz para los datos de una empresa que se recibirán del backend
interface CompanyData {
  idEmpresa: number;
  nombreEmpresa: string;
  nitEmpresa: string;
  logoBase64: string | null; // El logo viene como string Base64
}

// Define las props para el componente CompanyList
interface CompanyListProps {
  companies: CompanyData[]; // Array de empresas a mostrar
  onClose: () => void; // Función para cerrar la vista de la lista (volver a botones iniciales)
  onSelectCompany: (company: CompanyData) => void; // ¡NUEVO! Función para seleccionar una empresa
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onClose, onSelectCompany }) => {
  return (
    <div className={styles.companyListContainer}>
      <h2 className={styles.title}>Empresas Registradas</h2>
      
      {companies.length === 0 ? (
        <p className={styles.noCompaniesMessage}>No hay empresas registradas aún.</p>
      ) : (
        <div className={styles.companiesGrid}>
          {companies.map((company) => (
            // Hacemos la tarjeta clicable y pasamos la empresa seleccionada
            <button 
              key={company.idEmpresa} 
              className={styles.companyCard}
              onClick={() => onSelectCompany(company)} // Llama a onSelectCompany al hacer clic
            >
              <div className={styles.logoContainer}>
                {company.logoBase64 ? (
                  <img 
                    src={`data:image/png;base64,${company.logoBase64}`} // Asume PNG, ajusta si es necesario
                    alt={`Logo de ${company.nombreEmpresa}`} 
                    className={styles.companyLogo} 
                    onError={(e) => { 
                      e.currentTarget.onerror = null; // Evita bucles infinitos
                      e.currentTarget.src = 'https://placehold.co/120x120/cccccc/333333?text=No+Logo'; // Placeholder si falla
                    }}
                  />
                ) : (
                  <div className={styles.noLogoPlaceholder}>
                    <span>{company.nombreEmpresa.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <h3 className={styles.companyName}>{company.nombreEmpresa}</h3>
              <p className={styles.companyNit}>NIT: {company.nitEmpresa}</p>
              {/* Puedes añadir más detalles de la empresa aquí si EmpresaListDto los incluye */}
            </button>
          ))}
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button className="btn waves-effect waves-light grey darken-1" onClick={onClose}>
          Volver
          <i className="material-icons right">arrow_back</i>
        </button>
      </div>
    </div>
  );
};

export default CompanyList;
