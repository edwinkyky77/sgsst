// Models/PasswordResetToken.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace sgsst.Server.Models
{
    [Table("password_reset_tokens")] // Nueva tabla para tokens de recuperación
    public class PasswordResetToken
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; } // Foreign key to User

        [Required]
        [Column("token")]
        [StringLength(255)] // El token real (UUID o código aleatorio)
        public string Token { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required]
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("is_used")]
        public bool IsUsed { get; set; } = false; // Para marcar si el token ya fue utilizado

        [ForeignKey("UserId")]
        public User User { get; set; } = null!; // Propiedad de navegación
    }
}