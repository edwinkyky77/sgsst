// Models/User.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sgsst.Server.Models
{
    [Table("usuarios")] // ¡CORREGIDO! Nombre de la tabla 'usuarios'
    public class User
    {
        [Key]
        [Column("Id")] // Campo Id como clave primaria
        public int Id { get; set; }

        [Required]
        [Column("Nombres")] // ¡NUEVO CAMPO!
        [StringLength(255)]
        public string Nombres { get; set; } = string.Empty;

        [Required]
        [Column("Alias")] // Campo del usuario
        [StringLength(255)] // Ajustado a 255 según tu schema
        public string Alias { get; set; } = string.Empty;

        [Required]
        [Column("Password")] // Campo de la Contraseña (hash BCrypt)
        [StringLength(255)] // Confirmado a 255
        public string Password { get; set; } = string.Empty;

        [Required]
        [Column("Email")] // Campo Email
        [StringLength(45)] // Confirmado a 45
        public string Email { get; set; } = string.Empty;

        [Column("WhatsApp")] // ¡CORREGIDO! Campo WhatsApp, puede ser nulo
        [StringLength(15)] // Confirmado a 15
        public string? WhatsApp { get; set; } // Puede ser nulo

        [Required]
        [Column("TipoUsuario")] // ¡CORREGIDO! Campo de Permisos: TipoUsuario
        [StringLength(45)] // Confirmado a 45
        public string TipoUsuario { get; set; } = string.Empty;
    }
}