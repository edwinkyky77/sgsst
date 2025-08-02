using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sgsst.Server.Models // Asegúrate de que este namespace sea el correcto para tu proyecto
{
    [Table("empleado")] // Mapea esta clase a la tabla 'empleado' en la base de datos
    public class Empleado
    {
        [Key] // Indicates that idEmpleado is the primary key
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Indicates that it is auto-incremental
        public int IdEmpleado { get; set; }

        [Required]
        public int IdEmpresa { get; set; } // Foreign key to the 'empresa' table

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
        public string? Email { get; set; } // Nullable

        [Required]
        [StringLength(20)]
        public string NumeroIdentificacion { get; set; }

        [Required]
        [Column(TypeName = "date")] // Specifies the column type as DATE in MySQL
        public DateTime FechaNacimiento { get; set; }

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
        public string? Telefono { get; set; } // Nullable

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
        [Column(TypeName = "date")] // Specifies the column type as DATE in MySQL
        public DateTime FechaIngreso { get; set; }

        [Column(TypeName = "date")] // Specifies the column type as DATE in MySQL
        public DateTime? FechaEgreso { get; set; } // Nullable

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
        [Column(TypeName = "mediumblob")] // Mapea a MEDIUMBLOB en MySQL
        public byte[] HojaDeVida { get; set; }

        [Required]
        [Column(TypeName = "mediumblob")] // Mapea a MEDIUMBLOB en MySQL
        public byte[] FirmaEmpleado { get; set; }

        // Navigation property for the foreign key relationship
        [ForeignKey("IdEmpresa")]
        public virtual Empresa Empresa { get; set; } = null!; // Represents the associated company
    }
}
