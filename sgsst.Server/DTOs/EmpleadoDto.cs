using System;
using System.ComponentModel.DataAnnotations;

namespace sgsst.Server.DTOs // Asegúrate de que este namespace sea el correcto para tu proyecto
{
    public class EmpleadoDto
    {
        [Required]
        public int IdEmpresa { get; set; } // El ID de la empresa a la que pertenece el empleado

        [Required]
        [StringLength(100)]
        public string NombreCompleto { get; set; }

        [Required]
        [StringLength(100)]
        public string ApellidoCompleto { get; set; }

        [Required]
        [StringLength(15)]
        public string Genero { get; set; }

        [Required]
        [StringLength(20)]
        public string TipoIdentificacion { get; set; }

        [StringLength(50)]
        public string? Email { get; set; } // Puede ser nulo

        [Required]
        [StringLength(20)]
        public string NumeroIdentificacion { get; set; }

        [Required]
        // Se recibirá como string desde el frontend (ej. "dd-mm-yyyy")
        // El controlador lo convertirá a DateTime.
        public string FechaNacimiento { get; set; }

        [Required]
        [StringLength(15)]
        public string EstadoCivil { get; set; }

        [Required]
        [StringLength(25)]
        public string Nacionalidad { get; set; }

        [Required]
        [StringLength(5)]
        public string TipoSangre { get; set; }

        [StringLength(15)]
        public string? Telefono { get; set; } // Puede ser nulo

        [Required]
        [StringLength(100)]
        public string NameContact { get; set; }

        [Required]
        [StringLength(100)]
        public string TelContacto { get; set; }

        [Required]
        [StringLength(100)]
        public string DireccionResidencia { get; set; }

        [Required]
        [StringLength(50)]
        public string Barrio { get; set; }

        [Required]
        [StringLength(50)]
        public string Cargo { get; set; }

        [Required]
        // Se recibirá como string desde el frontend (ej. "dd-mm-yyyy")
        // El controlador lo convertirá a DateTime.
        public string FechaIngreso { get; set; }

        // Puede ser nulo
        // Se recibirá como string desde el frontend (ej. "dd-mm-yyyy") o null
        public string? FechaEgreso { get; set; }

        [Required]
        [StringLength(15)]
        public string StateContract { get; set; }

        [Required]
        [StringLength(20)]
        public string NivelAcademico { get; set; }

        [Required]
        [StringLength(30)]
        public string Eps { get; set; }

        [Required]
        [StringLength(20)]
        public string RegimenEps { get; set; }

        [Required]
        [StringLength(20)]
        public string FondoPensiones { get; set; }

        [Required]
        [StringLength(20)]
        public string FondoCesantias { get; set; }

        [Required]
        [StringLength(100)]
        public string Observaciones { get; set; }

        [Required]
        [StringLength(100)]
        public string OtherCourses { get; set; }

        [Required]
        // La hoja de vida se enviará como una cadena Base64 desde el frontend.
        public string HojaDeVida { get; set; }

        [Required]
        // La firma se enviará como una cadena Base64 desde el frontend.
        public string FirmaEmpleado { get; set; }
    }
}
