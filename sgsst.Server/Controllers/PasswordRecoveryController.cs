// Controllers/PasswordRecoveryController.cs
using Microsoft.AspNetCore.Mvc;
using sgsst.Server.DTOs;
using sgsst.Server.Services.PasswordRecovery;
using System.Net;

namespace sgsst.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordRecoveryController : ControllerBase
    {
        private readonly IPasswordRecoveryService _passwordRecoveryService;
        private readonly ILogger<PasswordRecoveryController> _logger;

        public PasswordRecoveryController(IPasswordRecoveryService passwordRecoveryService, ILogger<PasswordRecoveryController> logger)
        {
            _passwordRecoveryService = passwordRecoveryService;
            _logger = logger;
        }

        [HttpPost("request-reset")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var (success, message) = await _passwordRecoveryService.RequestPasswordReset(request);
                if (success)
                {
                    return Ok(new { Message = message });
                }
                else
                {
                    // No dar demasiada información si falla, solo un mensaje genérico.
                    // El mensaje específico es para el logger interno.
                    return BadRequest(new { Message = message }); // BadRequest si hay un error en el método (ej. no hay email)
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al solicitar recuperación de contraseña para alias: {Alias}", request.Alias);
                return StatusCode((int)HttpStatusCode.InternalServerError, new { Message = "Ocurrió un error interno al procesar la solicitud." });
            }
        }

        [HttpPost("reset-password")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.InternalServerError)]
        public async Task<IActionResult> ResetPassword([FromBody] PasswordResetConfirm request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var (success, message) = await _passwordRecoveryService.ResetPassword(request);
                if (success)
                {
                    return Ok(new { Message = message });
                }
                else
                {
                    return BadRequest(new { Message = message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al restablecer contraseña para alias: {Alias}", request.Alias);
                return StatusCode((int)HttpStatusCode.InternalServerError, new { Message = "Ocurrió un error interno al restablecer la contraseña." });
            }
        }
    }
}