// DTOs/LoginResponse.cs
namespace sgsst.Server.DTOs
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Alias { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public string Message { get; set; } = string.Empty; // Para mensajes de éxito/error
    }
}