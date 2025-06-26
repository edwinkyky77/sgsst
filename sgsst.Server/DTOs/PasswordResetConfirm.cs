// DTOs/PasswordResetConfirm.cs
using System.ComponentModel.DataAnnotations;

namespace sgsst.Server.DTOs
{
    public class PasswordResetConfirm
    {
        [Required(ErrorMessage = "El alias es requerido.")]
        public string Alias { get; set; } = string.Empty;

        [Required(ErrorMessage = "El código de verificación es requerido.")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "El código debe tener 6 dígitos.")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "La nueva contraseña es requerida.")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")] // Ejemplo de validación
        [DataType(DataType.Password)]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "La confirmación de la contraseña es requerida.")]
        [Compare("NewPassword", ErrorMessage = "La contraseña y la confirmación no coinciden.")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}