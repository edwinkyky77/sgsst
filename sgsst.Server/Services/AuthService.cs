// Services/AuthService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using sgsst.Server.Data; // Usar SgsstDbContext
using sgsst.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace sgsst.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly SgsstDbContext _context; // ¡CORREGIDO! SgsstDbContext
        private readonly IConfiguration _configuration;

        public AuthService(SgsstDbContext context, IConfiguration configuration) // ¡CORREGIDO! SgsstDbContext
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string?> AuthenticateUser(string alias, string password)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Alias == alias);

            if (user == null)
            {
                return null;
            }

            if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return null;
            }

            return GenerateJwtToken(user);
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secret = jwtSettings.GetValue<string>("Secret");
            var issuer = jwtSettings.GetValue<string>("Issuer");
            var audience = jwtSettings.GetValue<string>("Audience");
            var expirationInMinutes = jwtSettings.GetValue<int>("ExpirationInMinutes");

            if (string.IsNullOrEmpty(secret))
            {
                throw new ArgumentNullException(nameof(secret), "JWT Secret is not configured.");
            }

            var key = Encoding.UTF8.GetBytes(secret);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Alias),
                    new Claim(ClaimTypes.Role, user.TipoUsuario) // ¡CORREGIDO! Usar TipoUsuario como rol
                }),
                Expires = DateTime.UtcNow.AddMinutes(expirationInMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}