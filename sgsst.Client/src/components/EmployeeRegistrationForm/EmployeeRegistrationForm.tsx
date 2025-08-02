import React, { useState, useEffect, useRef } from 'react';
import M from 'materialize-css';
import SignaturePad from 'signature_pad'; // Necesitarás instalar 'signature_pad'
import styles from './EmployeeRegistrationForm.module.css'; // Estilos para el formulario

// Interfaz para los datos del empleado, coincidiendo con la tabla 'empleado'
interface EmployeeFormData {
  idEmpresa: number; // Se pasa desde el componente padre
  nombreCompleto: string;
  apellidoCompleto: string;
  genero: string;
  tipoIdentificacion: string;
  email: string;
  numeroIdentificacion: string;
  fechaNacimiento: string; // Formato dd-mm-yyyy
  estadoCivil: string;
  nacionalidad: string;
  tipoSangre: string;
  telefono: string;
  nameContact: string;
  telContacto: string;
  direccionResidencia: string;
  barrio: string;
  cargo: string;
  fechaIngreso: string; // Formato dd-mm-yyyy
  fechaEgreso: string | null; // Formato dd-mm-yyyy, puede ser nulo
  stateContract: string;
  nivelAcademico: string;
  eps: string;
  regimenEps: string;
  fondoPensiones: string;
  fondoCesantias: string;
  observaciones: string;
  otherCourses: string;
  hojaDeVida: string | null; // Base64
  firmaEmpleado: string | null; // Base64
  // fotoEmpleado: string | null; // Si se decide añadir a la DB, se incluiría aquí
}

// Props para el componente EmployeeRegistrationForm
interface EmployeeRegistrationFormProps {
  companyId: number; // El ID de la empresa a la que pertenece este empleado
  onClose: () => void; // Función para cerrar el formulario
}

// Mock de datos para los dropdowns (simulará un archivo JSON)
interface DropdownData {
  generos: string[];
  tiposIdentificacion: string[];
  estadosCiviles: string[];
  nacionalidades: string[];
  tiposSangre: string[];
  cargos: string[];
  estadosContrato: string[];
  nivelesAcademicos: string[];
  epsList: string[];
  regimenesEps: string[];
  fondosPensiones: string[];
  fondosCesantias: string[];
}

const mockDropdownData: DropdownData = {
  generos: ['Masculino', 'Femenino', 'No binario', 'Otro'],
  tiposIdentificacion: ['C.C.', 'C.E.', 'Pasaporte', 'T.I.', 'R.C.'],
  estadosCiviles: ['Soltero(a)', 'Casado(a)', 'Unión Libre', 'Divorciado(a)', 'Viudo(a)'],
  nacionalidades: ['Colombiana', 'Venezolana', 'Ecuatoriana', 'Peruana', 'Otra'],
  tiposSangre: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  cargos: ['Operario', 'Administrador', 'Ingeniero', 'Supervisor', 'Técnico', 'Auxiliar'],
  estadosContrato: ['Activo', 'Inactivo', 'Vacaciones', 'Licencia'],
  nivelesAcademicos: ['Primaria', 'Bachiller', 'Técnico', 'Tecnólogo', 'Profesional', 'Postgrado'],
  epsList: ['Sura EPS', 'Nueva EPS', 'Sanitas', 'Compensar', 'Coomeva', 'Famisanar'],
  regimenesEps: ['Contributivo', 'Subsidiado'],
  fondosPensiones: ['Colpensiones', 'Porvenir', 'Protección', 'Skandia', 'Colfondos'],
  fondosCesantias: ['Porvenir', 'Protección', 'Skandia', 'Colfondos', 'Fondo Nacional del Ahorro'],
};


const EmployeeRegistrationForm: React.FC<EmployeeRegistrationFormProps> = ({ companyId, onClose }) => {
  // Estados del formulario
  const [formData, setFormData] = useState<EmployeeFormData>({
    idEmpresa: companyId,
    nombreCompleto: '',
    apellidoCompleto: '',
    genero: '',
    tipoIdentificacion: '',
    email: '',
    numeroIdentificacion: '',
    fechaNacimiento: '',
    estadoCivil: '',
    nacionalidad: '',
    tipoSangre: '',
    telefono: '',
    nameContact: '',
    telContacto: '',
    direccionResidencia: '',
    barrio: '',
    cargo: '',
    fechaIngreso: '',
    fechaEgreso: null,
    stateContract: '',
    nivelAcademico: '',
    eps: '',
    regimenEps: '',
    fondoPensiones: '',
    fondoCesantias: '',
    observaciones: '',
    otherCourses: '',
    hojaDeVida: null,
    firmaEmpleado: null,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Refs para Materialize CSS selects
  const generoSelectRef = useRef<HTMLSelectElement>(null);
  const tipoIdentificacionSelectRef = useRef<HTMLSelectElement>(null);
  const estadoCivilSelectRef = useRef<HTMLSelectElement>(null);
  const nacionalidadSelectRef = useRef<HTMLSelectElement>(null);
  const tipoSangreSelectRef = useRef<HTMLSelectElement>(null);
  const cargoSelectRef = useRef<HTMLSelectElement>(null);
  const stateContractSelectRef = useRef<HTMLSelectElement>(null);
  const nivelAcademicoSelectRef = useRef<HTMLSelectElement>(null);
  const epsSelectRef = useRef<HTMLSelectElement>(null);
  const regimenEpsSelectRef = useRef<HTMLSelectElement>(null);
  const fondoPensionesSelectRef = useRef<HTMLSelectElement>(null);
  const fondoCesantiasSelectRef = useRef<HTMLSelectElement>(null);

  // Ref para el canvas de la firma
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Estado para la foto (si se captura por webcam o archivo)
  const [employeePhoto, setEmployeePhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null); // Ref para el input de tipo file para la foto

  // Inicializar Materialize selects
  useEffect(() => {
    const refs = [
      generoSelectRef, tipoIdentificacionSelectRef, estadoCivilSelectRef,
      nacionalidadSelectRef, tipoSangreSelectRef, cargoSelectRef,
      stateContractSelectRef, nivelAcademicoSelectRef, epsSelectRef,
      regimenEpsSelectRef, fondoPensionesSelectRef, fondoCesantiasSelectRef
    ];

    refs.forEach(ref => {
      if (ref.current) {
        const instance = M.FormSelect.getInstance(ref.current);
        if (instance) instance.destroy();
        M.FormSelect.init(ref.current);
      }
    });

    // Inicializar Datepickers
    const datepickerOptions = {
      format: 'dd-mm-yyyy',
      autoClose: true,
      i18n: {
        months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        weekdaysAbbrev: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
        cancel: 'Cancelar',
        clear: 'Limpiar',
        done: 'Ok'
      }
    };

    M.Datepicker.init(document.getElementById('fechaNacimiento')!, {
      ...datepickerOptions,
      onSelect: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        setFormData(prev => ({ ...prev, fechaNacimiento: `${day}-${month}-${year}` }));
      }
    });

    M.Datepicker.init(document.getElementById('fechaIngreso')!, {
      ...datepickerOptions,
      onSelect: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        setFormData(prev => ({ ...prev, fechaIngreso: `${day}-${month}-${year}` }));
      }
    });

    M.Datepicker.init(document.getElementById('fechaEgreso')!, {
      ...datepickerOptions,
      onSelect: (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        setFormData(prev => ({ ...prev, fechaEgreso: `${day}-${month}-${year}` }));
      }
    });

    // Inicializar SignaturePad
    if (signatureCanvasRef.current) {
      signaturePadRef.current = new SignaturePad(signatureCanvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)', // Fondo blanco para la firma
      });
    }

    // Limpiar SignaturePad al desmontar o al cerrar el formulario
    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current.clear();
      }
    };
  }, [formData.fechaNacimiento, formData.fechaIngreso, formData.fechaEgreso]); // Dependencias para reinicializar datepickers y selects

  // Manejador genérico para los cambios en los inputs del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      if (name === 'hojaDeVida') {
        if (file) {
          convertFileToBase64(file).then(base64 => {
            setFormData(prev => ({ ...prev, hojaDeVida: base64 }));
          }).catch(err => {
            console.error("Error al convertir hoja de vida a Base64:", err);
            setFormError("Error al procesar la hoja de vida.");
          });
        } else {
          setFormData(prev => ({ ...prev, hojaDeVida: null }));
        }
      } else if (name === 'employeePhoto') { // Para la foto del empleado
        if (file) {
          convertFileToBase64(file).then(base64 => {
            setEmployeePhoto(base64);
          }).catch(err => {
            console.error("Error al convertir foto a Base64:", err);
            setFormError("Error al procesar la foto.");
          });
        } else {
          setEmployeePhoto(null);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormError(null); // Limpiar errores al cambiar un campo
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

  // Función para guardar la firma
  const handleSaveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setFormData(prev => ({ ...prev, firmaEmpleado: signaturePadRef.current!.toDataURL() }));
      M.toast({ html: 'Firma capturada!', classes: 'green darken-1' });
    } else {
      M.toast({ html: 'Por favor, dibuje una firma.', classes: 'red darken-1' });
    }
  };

  // Función para limpiar la firma
  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setFormData(prev => ({ ...prev, firmaEmpleado: null }));
      M.toast({ html: 'Firma borrada.', classes: 'blue darken-1' });
    }
  };

  // Función para convertir fecha de dd-mm-yyyy a YYYY-MM-DD
  const convertDateToBackendFormat = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return null; // O lanzar un error si el formato es incorrecto
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    // Validaciones básicas (puedes expandir esto)
    if (!formData.nombreCompleto || !formData.apellidoCompleto || !formData.numeroIdentificacion ||
        !formData.fechaNacimiento || !formData.genero || !formData.tipoIdentificacion ||
        !formData.estadoCivil || !formData.nacionalidad || !formData.tipoSangre ||
        !formData.telefono || !formData.nameContact || !formData.telContacto ||
        !formData.direccionResidencia || !formData.barrio || !formData.cargo ||
        !formData.fechaIngreso || !formData.stateContract || !formData.nivelAcademico ||
        !formData.eps || !formData.regimenEps || !formData.fondoPensiones ||
        !formData.fondoCesantias || !formData.observaciones || !formData.otherCourses ||
        !formData.firmaEmpleado || !formData.hojaDeVida // Hoja de vida y firma son obligatorios
    ) {
      setFormError('Por favor, complete todos los campos obligatorios y capture la firma y suba la hoja de vida.');
      setLoading(false);
      return;
    }

    // Convertir fechas a formato de backend (YYYY-MM-DD)
    const dataToSend = {
      ...formData,
      fechaNacimiento: convertDateToBackendFormat(formData.fechaNacimiento),
      fechaIngreso: convertDateToBackendFormat(formData.fechaIngreso),
      fechaEgreso: convertDateToBackendFormat(formData.fechaEgreso),
      // No enviar employeePhoto si no hay campo en DB
      // Si el logo de la empresa se pasa aquí, asegúrate de que sea el correcto
    };

    console.log("Datos del empleado a enviar:", dataToSend);

    try {
      // ¡¡¡CORRECCIÓN CLAVE AQUÍ!!! Descomentar la llamada a la API
      const response = await fetch(`https://localhost:7266/api/Empleados/register_employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }
      
      M.toast({ html: '¡Empleado registrado exitosamente!', classes: 'green darken-1' });
      onClose(); // Cerrar el formulario al éxito

      // Limpiar el formulario después de un registro exitoso
      setFormData({
        idEmpresa: companyId,
        nombreCompleto: '', apellidoCompleto: '', genero: '', tipoIdentificacion: '', email: '',
        numeroIdentificacion: '', fechaNacimiento: '', estadoCivil: '', nacionalidad: '', tipoSangre: '',
        telefono: '', nameContact: '', telContacto: '', direccionResidencia: '', barrio: '',
        cargo: '', fechaIngreso: '', fechaEgreso: null, stateContract: '', nivelAcademico: '',
        eps: '', regimenEps: '', fondoPensiones: '', fondoCesantias: '', observaciones: '',
        otherCourses: '', hojaDeVida: null, firmaEmpleado: null,
      });
      setEmployeePhoto(null);
      if (signaturePadRef.current) signaturePadRef.current.clear();

    } catch (error) {
      console.error("Error al registrar empleado:", error);
      // Mostrar un mensaje de error más específico si es posible
      if (error instanceof Error) {
        setFormError(`Error al registrar el empleado: ${error.message}`);
      } else {
        setFormError("Error al registrar el empleado. Verifique la consola para más detalles.");
      }
      M.toast({ html: 'Error al registrar empleado.', classes: 'red darken-1' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.employeeFormContainer}>
      <h3 className="center-align" style={{ color: '#003366' }}>Registro de Empleado (Empresa ID: {companyId})</h3>
      {formError && <p className="red-text center-align">{formError}</p>}
      <form onSubmit={handleSubmit}>
        {/* Sección de Datos Personales */}
        <div className="card-panel z-depth-1" style={{ padding: '20px' }}>
          <h5 style={{ color: '#003366', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Datos Personales</h5>
          <div className="row">
            <div className="input-field col s12 m6">
              <input id="nombreCompleto" name="nombreCompleto" type="text" value={formData.nombreCompleto} onChange={handleChange} required />
              <label htmlFor="nombreCompleto">Nombres</label>
            </div>
            <div className="input-field col s12 m6">
              <input id="apellidoCompleto" name="apellidoCompleto" type="text" value={formData.apellidoCompleto} onChange={handleChange} required />
              <label htmlFor="apellidoCompleto">Apellidos</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <select id="genero" name="genero" ref={generoSelectRef} value={formData.genero} onChange={handleChange} required>
                <option value="" disabled>Selecciona Género</option>
                {mockDropdownData.generos.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="genero">Género</label>
            </div>
            <div className="input-field col s12 m6">
              <select id="tipoIdentificacion" name="tipoIdentificacion" ref={tipoIdentificacionSelectRef} value={formData.tipoIdentificacion} onChange={handleChange} required>
                <option value="" disabled>Tipo de Identificación</option>
                {mockDropdownData.tiposIdentificacion.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="tipoIdentificacion">Tipo de Identificación</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <input id="numeroIdentificacion" name="numeroIdentificacion" type="text" value={formData.numeroIdentificacion} onChange={handleChange} required />
              <label htmlFor="numeroIdentificacion">Número de Identificación</label>
            </div>
            <div className="input-field col s12 m6">
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <label htmlFor="email">Email</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <input id="fechaNacimiento" name="fechaNacimiento" type="text" className="datepicker" value={formData.fechaNacimiento} onChange={handleChange} required />
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento (dd-mm-yyyy)</label>
            </div>
            <div className="input-field col s12 m6">
              <select id="estadoCivil" name="estadoCivil" ref={estadoCivilSelectRef} value={formData.estadoCivil} onChange={handleChange} required>
                <option value="" disabled>Estado Civil</option>
                {mockDropdownData.estadosCiviles.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="estadoCivil">Estado Civil</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <select id="nacionalidad" name="nacionalidad" ref={nacionalidadSelectRef} value={formData.nacionalidad} onChange={handleChange} required>
                <option value="" disabled>Nacionalidad</option>
                {mockDropdownData.nacionalidades.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="nacionalidad">Nacionalidad</label>
            </div>
            <div className="input-field col s12 m6">
              <select id="tipoSangre" name="tipoSangre" ref={tipoSangreSelectRef} value={formData.tipoSangre} onChange={handleChange} required>
                <option value="" disabled>Tipo de Sangre</option>
                {mockDropdownData.tiposSangre.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="tipoSangre">Tipo de Sangre</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12">
              <input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} />
              <label htmlFor="telefono">Teléfono de Contacto</label>
            </div>
          </div>
        </div>

        {/* Sección de Contacto de Emergencia */}
        <div className="card-panel z-depth-1" style={{ padding: '20px', marginTop: '30px' }}>
          <h5 style={{ color: '#003366', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Contacto de Emergencia</h5>
          <div className="row">
            <div className="input-field col s12 m6">
              <input id="nameContact" name="nameContact" type="text" value={formData.nameContact} onChange={handleChange} required />
              <label htmlFor="nameContact">Nombre Completo Contacto</label>
            </div>
            <div className="input-field col s12 m6">
              <input id="telContacto" name="telContacto" type="tel" value={formData.telContacto} onChange={handleChange} required />
              <label htmlFor="telContacto">Teléfono Contacto</label>
            </div>
          </div>
        </div>

        {/* Sección de Dirección de Residencia */}
        <div className="card-panel z-depth-1" style={{ padding: '20px', marginTop: '30px' }}>
          <h5 style={{ color: '#003366', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Dirección de Residencia</h5>
          <div className="row">
            <div className="input-field col s12 m6">
              <input id="direccionResidencia" name="direccionResidencia" type="text" value={formData.direccionResidencia} onChange={handleChange} required />
              <label htmlFor="direccionResidencia">Dirección</label>
            </div>
            <div className="input-field col s12 m6">
              <input id="barrio" name="barrio" type="text" value={formData.barrio} onChange={handleChange} required />
              <label htmlFor="barrio">Barrio</label>
            </div>
          </div>
        </div>

        {/* Sección de Datos Laborales */}
        <div className="card-panel z-depth-1" style={{ padding: '20px', marginTop: '30px' }}>
          <h5 style={{ color: '#003366', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Datos Laborales</h5>
          <div className="row">
            <div className="input-field col s12 m6">
              <select id="cargo" name="cargo" ref={cargoSelectRef} value={formData.cargo} onChange={handleChange} required>
                <option value="" disabled>Selecciona Cargo</option>
                {mockDropdownData.cargos.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="cargo">Cargo</label>
            </div>
            <div className="input-field col s12 m6">
              <input id="fechaIngreso" name="fechaIngreso" type="text" className="datepicker" value={formData.fechaIngreso} onChange={handleChange} required />
              <label htmlFor="fechaIngreso">Fecha de Ingreso (dd-mm-yyyy)</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <input id="fechaEgreso" name="fechaEgreso" type="text" className="datepicker" value={formData.fechaEgreso || ''} onChange={handleChange} />
              <label htmlFor="fechaEgreso">Fecha de Egreso (dd-mm-yyyy, opcional)</label>
            </div>
            <div className="input-field col s12 m6">
              <select id="stateContract" name="stateContract" ref={stateContractSelectRef} value={formData.stateContract} onChange={handleChange} required>
                <option value="" disabled>Estado de Contrato</option>
                {mockDropdownData.estadosContrato.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="stateContract">Estado de Contrato</label>
            </div>
          </div>
        </div>

        {/* Sección de Seguridad Social y Educación */}
        <div className="card-panel z-depth-1" style={{ padding: '20px', marginTop: '30px' }}>
          <h5 style={{ color: '#003366', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Seguridad Social y Educación</h5>
          <div className="row">
            <div className="input-field col s12 m6">
              <select id="nivelAcademico" name="nivelAcademico" ref={nivelAcademicoSelectRef} value={formData.nivelAcademico} onChange={handleChange} required>
                <option value="" disabled>Nivel Académico</option>
                {mockDropdownData.nivelesAcademicos.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="nivelAcademico">Nivel Académico</label>
            </div>
            <div className="input-field col s12 m6">
              <input id="otherCourses" name="otherCourses" type="text" value={formData.otherCourses} onChange={handleChange} required />
              <label htmlFor="otherCourses">Otros Cursos / Capacitaciones</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <select id="eps" name="eps" ref={epsSelectRef} value={formData.eps} onChange={handleChange} required>
                <option value="" disabled>Selecciona EPS</option>
                {mockDropdownData.epsList.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="eps">EPS</label>
            </div>
            <div className="input-field col s12 m6">
              <select id="regimenEps" name="regimenEps" ref={regimenEpsSelectRef} value={formData.regimenEps} onChange={handleChange} required>
                <option value="" disabled>Régimen EPS</option>
                {mockDropdownData.regimenesEps.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="regimenEps">Régimen EPS</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <select id="fondoPensiones" name="fondoPensiones" ref={fondoPensionesSelectRef} value={formData.fondoPensiones} onChange={handleChange} required>
                <option value="" disabled>Fondo de Pensiones</option>
                {mockDropdownData.fondosPensiones.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="fondoPensiones">Fondo de Pensiones</label>
            </div>
            <div className="input-field col s12 m6">
              <select id="fondoCesantias" name="fondoCesantias" ref={fondoCesantiasSelectRef} value={formData.fondoCesantias} onChange={handleChange} required>
                <option value="" disabled>Fondo de Cesantías</option>
                {mockDropdownData.fondosCesantias.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              <label htmlFor="fondoCesantias">Fondo de Cesantías</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12">
              <textarea id="observaciones" name="observaciones" className="materialize-textarea" value={formData.observaciones} onChange={handleChange} required></textarea>
              <label htmlFor="observaciones">Observaciones</label>
            </div>
          </div>
        </div>

        {/* Sección de Archivos y Firma */}
        <div className="card-panel z-depth-1" style={{ padding: '20px', marginTop: '30px' }}>
          <h5 style={{ color: '#003366', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Archivos y Firma</h5>
          <div className="row">
            {/* Input para Hoja de Vida */}
            <div className="file-field input-field col s12 m6">
              <div className="btn waves-effect waves-light blue darken-1">
                <span>Hoja de Vida</span>
                <input 
                  type="file" 
                  name="hojaDeVida" 
                  onChange={handleChange} 
                  accept=".pdf,.doc,.docx" // Aceptar solo documentos
                  aria-label="Subir Hoja de Vida" 
                  required
                />
              </div>
              <div className="file-path-wrapper">
                <input 
                  className="file-path validate" 
                  type="text" 
                  placeholder="Subir Hoja de Vida (PDF, DOCX)" 
                  value={formData.hojaDeVida ? 'Archivo cargado' : ''} 
                  readOnly 
                />
              </div>
              {formData.hojaDeVida && <p className="green-text">Hoja de Vida cargada.</p>}
            </div>

            {/* Input para Foto del Empleado (opcional, si no está en DB) */}
            <div className="file-field input-field col s12 m6">
              <div className="btn waves-effect waves-light teal darken-1">
                <span>Foto Empleado</span>
                <input 
                  type="file" 
                  name="employeePhoto" 
                  onChange={handleChange} 
                  accept="image/*" 
                  aria-label="Subir Foto del Empleado" 
                  ref={photoInputRef} /* ¡CORRECCIÓN AQUÍ! Asignar la referencia */
                />
              </div>
              <div className="file-path-wrapper">
                <input 
                  className="file-path validate" 
                  type="text" 
                  placeholder="Subir Foto del Empleado (opcional)" 
                  value={employeePhoto ? 'Foto cargada' : ''} 
                  readOnly 
                />
              </div>
              {employeePhoto && <p className="green-text">Foto cargada.</p>}
              {employeePhoto && (
                <div className={styles.photoPreview}>
                  <img src={employeePhoto} alt="Previsualización de la foto del empleado" className="responsive-img" />
                </div>
              )}
            </div>
          </div>

          {/* Sección de Firma del Empleado */}
          <div className="row" style={{ marginTop: '20px' }}>
            <div className="col s12">
              <label>Firma del Empleado</label>
              <div className={styles.signaturePadContainer}>
                <canvas 
                  ref={signatureCanvasRef} 
                  className={styles.signatureCanvas}
                  width="400" 
                  height="200"
                ></canvas>
              </div>
              <div className="center-align" style={{ marginTop: '10px' }}>
                <button type="button" className="btn waves-effect waves-light blue" onClick={handleSaveSignature} style={{ marginRight: '10px' }}>
                  Guardar Firma
                  <i className="material-icons right">check</i>
                </button>
                <button type="button" className="btn waves-effect waves-light red" onClick={handleClearSignature}>
                  Borrar Firma
                  <i className="material-icons right">clear</i>
                </button>
              </div>
              {formData.firmaEmpleado && (
                <div className={styles.signaturePreview}>
                  <p>Firma Capturada:</p>
                  <img src={formData.firmaEmpleado} alt="Firma del empleado" className="responsive-img" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción del Formulario */}
        <div className="card-action center-align" style={{ marginTop: '30px' }}>
          <button
            className="btn waves-effect waves-light blue darken-2"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Empleado'}
            <i className="material-icons right">send</i>
          </button>
          <button
            className="btn waves-effect waves-light grey darken-1 ms-2"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
            <i className="material-icons right">cancel</i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistrationForm;
