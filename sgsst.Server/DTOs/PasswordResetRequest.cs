// DTOs/PasswordResetRequest.cs
using System.ComponentModel.DataAnnotations;

namespace sgsst.Server.DTOs
{
    public class PasswordResetRequest
    {
        [Required(ErrorMessage = "El alias es requerido.")]
        public string Alias { get; set; } = string.Empty;

        [Required(ErrorMessage = "El método de recuperación (whatsapp o email) es requerido.")]
        [RegularExpression("^(whatsapp|email)$", ErrorMessage = "El método debe ser 'whatsapp' o 'email'.")]
        public string Method { get; set; } = string.Empty; // "whatsapp" o "email"
    }
}