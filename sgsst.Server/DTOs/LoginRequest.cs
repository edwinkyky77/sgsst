// DTOs/LoginRequest.cs
using System.ComponentModel.DataAnnotations;

namespace sgsst.Server.DTOs
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "El alias es requerido.")]
        public string Alias { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida.")]
        public string Password { get; set; } = string.Empty;
    }
}