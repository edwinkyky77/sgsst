// sgsst.Client/src/components/RegistroDeEmpresa/FactoryForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import M from 'materialize-css';
import styles from './FactoryForm.module.css'; 

interface FactoryFormProps {
  showFactoryForm: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>; 
  onSuccess: (message: string) => void;
  onError: (message: string) => void; 
}

// Interfaz para los datos del formulario, COINCIDIENDO ESTRICTAMENTE con las columnas de tu tabla 'empresa'
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

// Define la interfaz para la estructura de tus datos de Colombia
interface ColombiaData {
  [key: string]: {
    capital: string; 
    municipios: string[];
  };
}

const FactoryForm: React.FC<FactoryFormProps> = ({ showFactoryForm, onClose, onSave, onSuccess, onError }) => {
  // Estados para los campos del formulario, ahora coincidiendo con SQL
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nitEmpresa, setNitEmpresa] = useState('');
  const [direccionEmpresa, setDireccionEmpresa] = useState('');
  const [telefonoEmpresa, setTelefonoEmpresa] = useState('');
  const [email, setEmail] = useState(''); 
  const [logoFile, setLogoFile] = useState<File | null>(null); 
  const [contactoGerente, setContactoGerente] = useState(''); 
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [nombreGerente, setNombreGerente] = useState('');
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [direccionProyecto, setDireccionProyecto] = useState('');
  const [sisoJefe, setSisoJefe] = useState('');
  const [EmpresaCol, setEmpresaCol] = useState('');

  // Estados para cargar y manejar los datos de colombia.json
  const [departamentosList, setDepartamentosList] = useState<string[]>([]);
  const [municipiosList, setMunicipiosList] = useState<string[]>([]);
  const [colombiaDataState, setColombiaDataState] = useState<ColombiaData | null>(null);

  // Refs para los selects de Materialize CSS
  const departamentoSelectRef = useRef<HTMLSelectElement>(null);
  const municipioSelectRef = useRef<HTMLSelectElement>(null);

  // Estado de error para la validación del formulario (interno del form)
  const [formError, setFormError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false); 

  // 1. Cargar los datos de colombia.json desde la carpeta 'public'
  useEffect(() => {
    const fetchColombiaData = async () => {
      try {
        const response = await fetch('/colombia.json'); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ColombiaData = await response.json();
        setColombiaDataState(data); 
      } catch (error) {
        console.error("Error cargando los datos de Colombia:", error);
        setFormError("No se pudieron cargar los datos de ubicación. Intente más tarde.");
      }
    };
    fetchColombiaData();
  }, []); 

  // 2. Cargar la lista de departamentos cuando los datos de Colombia estén disponibles
  useEffect(() => {
    if (colombiaDataState) {
      setDepartamentosList(Object.keys(colombiaDataState).sort());
    }
  }, [colombiaDataState]); 

  // 3. Lógica para actualizar los municipios cuando cambia el departamento
  useEffect(() => {
    if (colombiaDataState && departamento) {
      const departmentData = colombiaDataState[departamento];
      if (departmentData) {
        const { capital, municipios } = departmentData; 

        let selectedDefaultMunicipio = '';
        let municipiosForSorting = [...municipios]; 

        if (capital && municipiosForSorting.includes(capital)) {
          selectedDefaultMunicipio = capital;
          municipiosForSorting = municipiosForSorting.filter(m => m !== capital);
        } else if (municipiosForSorting.length > 0) {
          municipiosForSorting.sort(); 
          selectedDefaultMunicipio = municipiosForSorting[0];
          municipiosForSorting = municipiosForSorting.filter(m => m !== selectedDefaultMunicipio); 
        }

        municipiosForSorting.sort();

        const finalMunicipiosList = selectedDefaultMunicipio ? [selectedDefaultMunicipio, ...municipiosForSorting] : municipiosForSorting;
        
        setMunicipiosList(finalMunicipiosList);
        setMunicipio(selectedDefaultMunicipio); 

      } else {
        setMunicipiosList([]);
        setMunicipio('');
      }
    } else {
      setMunicipiosList([]);
      setMunicipio('');
    }
  }, [departamento, colombiaDataState]); 

  // 4. Inicialización y re-inicialización de los selects de Materialize
  useEffect(() => {
    if (departamentoSelectRef.current) {
      const instance = M.FormSelect.getInstance(departamentoSelectRef.current);
      if (instance) instance.destroy(); 
      M.FormSelect.init(departamentoSelectRef.current);
    }
  }, [departamentosList]); 

  useEffect(() => {
    if (municipioSelectRef.current) {
        const instance = M.FormSelect.getInstance(municipioSelectRef.current);
        if (instance) instance.destroy(); 
        
        setTimeout(() => {
            M.FormSelect.init(municipioSelectRef.current!); 
        }, 0); 
    }
  }, [municipiosList, municipio]); 

  // Manejador genérico para los cambios en los inputs del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setLogoFile(file); 
    } else {
      switch (name) {
        case 'nombreEmpresa': setNombreEmpresa(value); break;
        case 'nitEmpresa': setNitEmpresa(value); break;
        case 'direccionEmpresa': setDireccionEmpresa(value); break;
        case 'telefonoEmpresa': setTelefonoEmpresa(value); break;
        case 'email': setEmail(value); break;
        case 'contactoGerente': setContactoGerente(value); break; 
        case 'departamento': setDepartamento(value); break;
        case 'municipio': setMunicipio(value); break;
        case 'nombreGerente': setNombreGerente(value); break;
        case 'nombreProyecto': setNombreProyecto(value); break;
        case 'direccionProyecto': setDireccionProyecto(value); break;
        case 'sisoJefe': setSisoJefe(value); break;
        case 'EmpresaCol': setEmpresaCol(value); break;
        default: break;
      }
    }
    setFormError(null); 
  };

  // Función para convertir File a Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setFormError(null); 

    // 1. Validación de campos obligatorios
    if (!nombreEmpresa || !nitEmpresa || !direccionEmpresa || !telefonoEmpresa || !email || 
        !contactoGerente || !departamento || !municipio ||
        !nombreGerente || !nombreProyecto || !direccionProyecto || !sisoJefe || !EmpresaCol) {
      setFormError('Por favor, complete todos los campos obligatorios.');
      setLoading(false); 
      return;
    }

    let logoBase64: string | null = null;
    if (logoFile) {
      try {
        logoBase64 = await convertFileToBase64(logoFile);
      } catch (error) {
        console.error("Error al convertir el logo a Base64:", error);
        setFormError('Error al procesar el logo. Por favor, intente con otra imagen.');
        setLoading(false);
        return;
      }
    }

    const formData: FormData = {
      nombreEmpresa,
      nitEmpresa,
      direccionEmpresa,
      telefonoEmpresa,
      email, 
      logo: logoBase64, 
      contactoGerente,
      departamento,
      municipio,
      nombreGerente,
      nombreProyecto,
      direccionProyecto,
      sisoJefe,
      EmpresaCol,
    };

    try {
      await onSave(formData); 
      onSuccess('¡Empresa registrada exitosamente!'); 
      
      // Limpiar campos del formulario
      setNombreEmpresa('');
      setNitEmpresa('');
      setDireccionEmpresa('');
      setTelefonoEmpresa('');
      setEmail('');
      setLogoFile(null); 
      setContactoGerente('');
      setDepartamento('');
      setMunicipio('');
      setNombreGerente('');
      setNombreProyecto('');
      setDireccionProyecto('');
      setSisoJefe('');
      setEmpresaCol('');
      
      onClose(); 
    } catch (backendError: unknown) { // ¡CORREGIDO! Cambiado 'any' a 'unknown'
      console.error("Error al registrar la empresa en el backend:", backendError);
      // Asegurarse de que backendError sea una instancia de Error antes de acceder a .message
      if (backendError instanceof Error) {
        onError(backendError.message || "Error al registrar la empresa. Intente más tarde.");
      } else {
        onError("Error desconocido al registrar la empresa. Intente más tarde.");
      }
    } finally {
      setLoading(false); 
    }
  };

  const handleCloseForm = () => {
    // Restablece los campos del formulario al cerrarlo
    setNombreEmpresa('');
    setNitEmpresa('');
    setDireccionEmpresa('');
    setTelefonoEmpresa('');
    setEmail('');
    setLogoFile(null);
    setContactoGerente('');
    setDepartamento('');
    setMunicipio('');
    setNombreGerente('');
    setNombreProyecto('');
    setDireccionProyecto('');
    setSisoJefe('');
    setEmpresaCol('');
    setFormError(null);
    onClose();
  };

  return (
    <div className={`${styles.factoryFormOverlayWrapper} ${showFactoryForm ? styles.show : ''}`}>
      <div className={`${styles.formCard} card`}>
        <div className="card-content">
          <span className="card-title center-align">Registrar Nueva Empresa</span>
          {formError && <p className="red-text center-align">{formError}</p>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="input-field col s12 m6">
                <input id="nombreEmpresa" name="nombreEmpresa" type="text" value={nombreEmpresa} onChange={handleChange} required />
                <label htmlFor="nombreEmpresa">Nombre de la Empresa</label>
              </div>
              <div className="input-field col s12 m6">
                <input id="nitEmpresa" name="nitEmpresa" type="text" value={nitEmpresa} onChange={handleChange} required />
                <label htmlFor="nitEmpresa">NIT de la Empresa</label>
              </div>
            </div>

            <div className="row">
              <div className="input-field col s12 m6">
                <input id="direccionEmpresa" name="direccionEmpresa" type="text" value={direccionEmpresa} onChange={handleChange} required />
                <label htmlFor="direccionEmpresa">Dirección de la Empresa</label>
              </div>
              <div className="input-field col s12 m6">
                <input id="telefonoEmpresa" name="telefonoEmpresa" type="tel" value={telefonoEmpresa} onChange={handleChange} required />
                <label htmlFor="telefonoEmpresa">Teléfono de la Empresa</label>
              </div>
            </div>

            <div className="row">
              <div className="input-field col s12 m6">
                <input id="email" name="email" type="email" value={email} onChange={handleChange} required />
                <label htmlFor="email">Email de la Empresa</label> 
              </div>
              <div className="file-field input-field col s12 m6">
                <div className="btn waves-effect waves-light blue darken-1">
                  <span>Logo</span>
                  <input 
                    type="file" 
                    name="logo" 
                    onChange={handleChange} 
                    accept="image/*" 
                    aria-label="Subir logo de la empresa" 
                  />
                </div>
                <div className="file-path-wrapper">
                  <input 
                    className="file-path validate" 
                    type="text" 
                    placeholder="Subir logo de la empresa (opcional)" 
                    value={logoFile ? logoFile.name : ''} 
                    readOnly 
                  />
                </div>
              </div>
            </div>

            <div className="divider"></div>
            <h6 className="center-align" style={{ marginTop: '20px', marginBottom: '20px', color: '#003366' }}>Contacto del Gerente</h6>

            <div className="row">
              <div className="input-field col s12 m6"> 
                <input id="nombreGerente" name="nombreGerente" type="text" value={nombreGerente} onChange={handleChange} required />
                <label htmlFor="nombreGerente">Nombre Completo del Gerente</label>
              </div>
              <div className="input-field col s12 m6"> 
                <input id="contactoGerente" name="contactoGerente" type="text" value={contactoGerente} onChange={handleChange} required />
                <label htmlFor="contactoGerente">Contacto del Gerente (Teléfono, Email, u Otros)</label> 
              </div>
            </div>

            <div className="divider"></div>
            <h6 className="center-align" style={{ marginTop: '20px', marginBottom: '20px', color: '#003366' }}>Ubicación y Datos de Proyecto</h6>

            <div className="row">
              <div className="input-field col s12 m6">
                <select 
                  id="departamento" 
                  name="departamento" 
                  ref={departamentoSelectRef} 
                  value={departamento} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled>Selecciona un Departamento</option>
                  {departamentosList.map(depName => (
                    <option key={depName} value={depName}>{depName}</option>
                  ))}
                </select>
                <label htmlFor="departamento">Departamento</label>
              </div>
              <div className="input-field col s12 m6">
                <select 
                  id="municipio" 
                  name="municipio" 
                  ref={municipioSelectRef} 
                  value={municipio} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled={municipiosList.length > 0}>Selecciona un Municipio</option>
                  {municipiosList.map(munName => (
                    <option key={munName} value={munName}>{munName}</option>
                  ))}
                </select>
                <label htmlFor="municipio">Municipio</label>
              </div>
            </div>

            <div className="row">
              <div className="input-field col s12 m6">
                <input id="nombreProyecto" name="nombreProyecto" type="text" value={nombreProyecto} onChange={handleChange} required />
                <label htmlFor="nombreProyecto">Nombre del Proyecto</label>
              </div>
              <div className="input-field col s12 m6">
                <input id="direccionProyecto" name="direccionProyecto" type="text" value={direccionProyecto} onChange={handleChange} required />
                <label htmlFor="direccionProyecto">Dirección del Proyecto</label>
              </div>
            </div>
            
            <div className="row">
              <div className="input-field col s12 m6">
                <input id="sisoJefe" name="sisoJefe" type="text" value={sisoJefe} onChange={handleChange} required />
                <label htmlFor="sisoJefe">SISO Jefe</label>
              </div>
              <div className="input-field col s12 m6"> 
                <input id="EmpresaCol" name="EmpresaCol" type="text" value={EmpresaCol} onChange={handleChange} required />
                <label htmlFor="EmpresaCol">Información Adicional de la Empresa</label>
              </div>
            </div>

            <div className="card-action center-align">
              <button
                className="btn waves-effect waves-light blue darken-2"
                type="submit"
                disabled={!colombiaDataState || loading} 
              >
                {loading ? 'Registrando...' : 'Registrar Empresa'}
                <i className="material-icons right">send</i>
              </button>
              <button
                className="btn waves-effect waves-light grey darken-1 ms-2"
                type="button"
                onClick={handleCloseForm}
                disabled={loading} 
              >
                Cancelar
                <i className="material-icons right">cancel</i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FactoryForm;
