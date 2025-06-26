// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using sgsst.Server.DTOs; // Asegúrate de que esta ruta sea correcta para tus DTOs
using sgsst.Server.Services;
using System.Net; // Para HttpStatus
using System.Security.Claims; // Para trabajar con Claims
using System.IdentityModel.Tokens.Jwt; // Para leer el token JWT


namespace sgsst.Server.Controllers
{
    [ApiController] // Indica que esta clase es un controlador de API
    [Route("api/[controller]")] // Define la ruta base para este controlador (ej. /api/Auth)
    public class AuthController : ControllerBase // Hereda de ControllerBase para funcionalidades de controlador API
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger; // Para logging y manejo de errores

        // Constructor con inyección de dependencias
        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Permite a un usuario iniciar sesión en el sistema.
        /// </summary>
        /// <param name="request">Objeto que contiene el alias y la contraseña del usuario.</param>
        /// <returns>Un token de autenticación JWT si las credenciales son válidas,
        /// o un error si no lo son.</returns>
        [HttpPost("login")] // Define que este método responde a solicitudes POST en /api/Auth/login
        [ProducesResponseType((int)HttpStatusCode.OK, Type = typeof(LoginResponse))] // Documenta los posibles tipos de respuesta
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request) // [FromBody] indica que los datos vienen en el cuerpo de la solicitud
        {
            // 1. Validación del modelo de entrada
            if (!ModelState.IsValid)
            {
                // Si la validación falla (ej. campos requeridos vacíos), devuelve un BadRequest con los errores
                _logger.LogWarning("Intento de login con datos inválidos. Errores: {Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }

            try
            {
                // 2. Autenticar el usuario a través del servicio de autenticación
                var token = await _authService.AuthenticateUser(request.Alias, request.Password);

                // 3. Verificar si la autenticación fue exitosa
                if (token == null)
                {
                    // Si el token es nulo, las credenciales son inválidas
                    _logger.LogWarning("Intento de inicio de sesión fallido para el alias: {Alias} - Credenciales inválidas.", request.Alias);
                    return Unauthorized(new { Message = "Credenciales inválidas." }); // Devolver 401 Unauthorized
                }

                // 4. Si el token se generó, decodificarlo para obtener detalles y devolver la respuesta
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

                // Obtener la fecha de expiración y el tipo de usuario (rol) del token
                var expiration = jwtToken?.ValidTo ?? DateTime.UtcNow;
                var userType = jwtToken?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

                _logger.LogInformation("Inicio de sesión exitoso para el alias: {Alias}. Tipo de Usuario: {UserType}", request.Alias, userType);

                // Devolver 200 OK con el token y los datos del usuario
                return Ok(new LoginResponse
                {
                    Token = token,
                    Alias = request.Alias,
                    UserType = userType ?? "desconocido", // Asegura que UserType no sea nulo
                    Expiration = expiration,
                    Message = "Inicio de sesión exitoso."
                });
            }
            catch (Exception ex)
            {
                // 5. Manejo de errores inesperados
                _logger.LogError(ex, "Error crítico durante el proceso de login para el alias: {Alias}", request.Alias);
                // Devolver 500 Internal Server Error y un mensaje genérico por seguridad
                return StatusCode((int)HttpStatusCode.InternalServerError, new { Message = "Ocurrió un error interno del servidor durante el proceso de inicio de sesión." });
            }
        }
    }
}