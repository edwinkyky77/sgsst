// Services/PasswordRecovery/PasswordRecoveryService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using sgsst.Server.Data; // Usar SgsstDbContext
using sgsst.Server.Models;
using sgsst.Server.Services.Notifications;
using sgsst.Server.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using Microsoft.Extensions.Logging; // Asegúrate de tener esto
using Microsoft.AspNetCore.Mvc; // ¡NUEVO! Necesario para [FromKeyedServices]

namespace sgsst.Server.Services.PasswordRecovery
{
    public class PasswordRecoveryService : IPasswordRecoveryService
    {
        private readonly SgsstDbContext _context;
        private readonly IMessageSender _whatsappSender;
        private readonly IMessageSender _emailSender;
        private readonly IPhoneNumberNormalizer _phoneNumberNormalizer;
        private readonly ILogger<PasswordRecoveryService> _logger;
        private readonly IConfiguration _configuration;

        public PasswordRecoveryService(
            SgsstDbContext context,
            [FromKeyedServices("whatsapp")] IMessageSender whatsappSender,
            [FromKeyedServices("email")] IMessageSender emailSender,
            IPhoneNumberNormalizer phoneNumberNormalizer,
            ILogger<PasswordRecoveryService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _whatsappSender = whatsappSender;
            _emailSender = emailSender;
            _phoneNumberNormalizer = phoneNumberNormalizer;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<(bool success, string message)> RequestPasswordReset(PasswordResetRequest request)
        {
            var user = await _context.Users
                                     .SingleOrDefaultAsync(u => u.Alias == request.Alias);

            if (user == null)
            {
                _logger.LogWarning("Intento de recuperación de contraseña fallido para alias no existente: {Alias}", request.Alias);
                return (false, "Si el alias existe, se enviará un código de recuperación.");
            }

            // Limpiar tokens viejos o ya usados para este usuario
            var oldTokens = await _context.PasswordResetTokens
                                          .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt < DateTime.UtcNow)
                                          .ToListAsync();
            if (oldTokens.Any())
            {
                _context.PasswordResetTokens.RemoveRange(oldTokens);
                await _context.SaveChangesAsync();
            }

            // Generar un código de 6 dígitos
            var code = new Random().Next(100000, 999999).ToString();
            // Puedes configurar la duración del token en appsettings.json si lo necesitas
            var expirationMinutes = _configuration.GetValue<int>("PasswordResetSettings:CodeExpirationMinutes", 10);
            var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = code,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt,
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            var messageBody = $"Tu código de recuperación de contraseña para SGSST es: {code}. Válido por {expirationMinutes} minutos.";
            var emailSubject = "Recuperación de Contraseña SGSST"; // Asunto para el correo electrónico

            bool sent = false;
            if (request.Method.Equals("whatsapp", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(user.WhatsApp))
                {
                    _logger.LogWarning("Usuario {Alias} intentó recuperación por WhatsApp sin número registrado.", user.Alias);
                    return (false, "No se encontró un número de WhatsApp registrado para este usuario.");
                }
                var normalizedPhoneNumber = _phoneNumberNormalizer.Normalize(user.WhatsApp);
                // ¡CORRECCIÓN CLAVE AQUÍ! Cambiado SendMessage a SendAsync y añadido el subject
                await _whatsappSender.SendAsync(normalizedPhoneNumber, emailSubject, messageBody);
                sent = true; // Asumimos éxito si no lanza excepción
            }
            else if (request.Method.Equals("email", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrEmpty(user.Email))
                {
                    _logger.LogWarning("Usuario {Alias} intentó recuperación por Email sin email registrado.", user.Alias);
                    return (false, "No se encontró un email registrado para este usuario.");
                }
                // ¡CORRECCIÓN CLAVE AQUÍ! Cambiado SendMessage a SendAsync y añadido el subject
                await _emailSender.SendAsync(user.Email, emailSubject, messageBody);
                sent = true; // Asumimos éxito si no lanza excepción
            }
            else
            {
                return (false, "Método de recuperación no válido.");
            }

            if (sent)
            {
                _logger.LogInformation("Código de recuperación enviado exitosamente a {Alias} por {Method}.", user.Alias, request.Method);
                return (true, $"Código de recuperación enviado a tu {request.Method} registrado.");
            }
            else
            {
                _logger.LogError("Fallo al enviar código de recuperación a {Alias} por {Method}.", user.Alias, request.Method);
                return (false, $"Fallo al enviar el código de recuperación. Intenta de nuevo más tarde o contacta a soporte.");
            }
        }

        public async Task<(bool success, string message)> ResetPassword(PasswordResetConfirm request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Alias == request.Alias);

            if (user == null)
            {
                return (false, "Usuario no encontrado.");
            }

            var tokenRecord = await _context.PasswordResetTokens
                                            .Where(t => t.UserId == user.Id &&
                                                        t.Token == request.Code &&
                                                        !t.IsUsed &&
                                                        t.ExpiresAt > DateTime.UtcNow)
                                            .OrderByDescending(t => t.CreatedAt)
                                            .FirstOrDefaultAsync();

            if (tokenRecord == null)
            {
                _logger.LogWarning("Intento de restablecimiento de contraseña fallido para {Alias} con código inválido/expirado.", request.Alias);
                return (false, "Código de verificación inválido o expirado.");
            }

            if (request.NewPassword.Length < 8)
            {
                return (false, "La nueva contraseña debe tener al menos 8 caracteres.");
            }
            if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.Password))
            {
                return (false, "La nueva contraseña no puede ser igual a la anterior.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            tokenRecord.IsUsed = true;

            try
            {
                _context.Users.Update(user);
                _context.PasswordResetTokens.Update(tokenRecord);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Contraseña restablecida exitosamente para {Alias}.", user.Alias);
                return (true, "Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al restablecer la contraseña para {Alias}.", request.Alias);
                return (false, "Ocurrió un error al restablecer la contraseña.");
            }
        }
    }
}
