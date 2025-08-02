// Models/Empresa.cs
// Esta clase representa la entidad (tabla) 'empresa' en la base de datos MySQL.

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sgsst.Server.Models // Asegúrate de que este namespace sea el correcto para tu proyecto
{
    [Table("empresa")] // Mapea esta clase a la tabla 'empresa' en la base de datos
    public class Empresa
    {
        [Key] // Indica que idEmpresa es la clave primaria
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Indica que es auto-incremental
        public int IdEmpresa { get; set; }

        // ¡CORRECCIÓN! Se añade 'required' para propiedades no nulas
        [Required]
        [StringLength(255)]
        public required string NombreEmpresa { get; set; }

        [Required]
        [StringLength(255)]
        public required string NitEmpresa { get; set; }

        [Required]
        [StringLength(255)]
        public required string DireccionEmpresa { get; set; }

        [Required]
        [StringLength(255)]
        public required string TelefonoEmpresa { get; set; }

        [Required]
        [StringLength(255)]
        public required string Email { get; set; } // Email de la empresa

        // longblob en MySQL se mapea a byte[] en C#.
        // Según tu esquema SQL, 'logo' es NOT NULL.
        [Required]
        public required byte[] Logo { get; set; }

        [Required]
        [StringLength(255)]
        public required string ContactoGerente { get; set; } // Contacto general del gerente

        [Required]
        [StringLength(255)]
        public required string Departamento { get; set; }

        [Required]
        [StringLength(255)]
        public required string Municipio { get; set; }

        [Required]
        [StringLength(255)]
        public required string NombreGerente { get; set; } // Nombre completo del gerente

        [Required]
        [StringLength(255)]
        public required string NombreProyecto { get; set; }

        [Required]
        [StringLength(255)]
        public required string DireccionProyecto { get; set; }

        [Required]
        [StringLength(255)]
        public required string SisoJefe { get; set; }

        [Required]
        [StringLength(255)]
        public required string EmpresaCol { get; set; } // Campo adicional de la empresa
    }
}
