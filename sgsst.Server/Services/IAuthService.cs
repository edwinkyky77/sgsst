// Services/IAuthService.cs
using sgsst.Server.Models;

namespace sgsst.Server.Services
{
    public interface IAuthService
    {
        Task<string?> AuthenticateUser(string alias, string password);
        string GenerateJwtToken(User user);
    }
}