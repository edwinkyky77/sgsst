// Services/Notifications/EmailSender.cs
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace sgsst.Server.Services.Notifications
{
    public class EmailSender : IMessageSender
    {
        private readonly IConfiguration _configuration;

        public EmailSender(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendMessage(string destination, string message)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpServer = emailSettings.GetValue<string>("SmtpServer");
            var smtpPort = emailSettings.GetValue<int>("SmtpPort");
            var senderEmail = emailSettings.GetValue<string>("SenderEmail");
            var senderPassword = emailSettings.GetValue<string>("SenderPassword");
            var senderName = emailSettings.GetValue<string>("SenderName");

            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
            {
                // Considera lanzar una excepción o registrar un error
                return false;
            }

            using (var client = new SmtpClient(smtpServer, smtpPort))
            {
                client.EnableSsl = true; // Habilitar SSL/TLS
                client.UseDefaultCredentials = false;
                client.Credentials = new NetworkCredential(senderEmail, senderPassword);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = "Recuperación de Contraseña SGSST",
                    Body = message,
                    IsBodyHtml = false, // Puedes cambiar a true si el mensaje es HTML
                };
                mailMessage.To.Add(destination);

                try
                {
                    await client.SendMailAsync(mailMessage);
                    return true;
                }
                catch (SmtpException ex)
                {
                    Console.WriteLine($"Error SMTP al enviar email: {ex.StatusCode} - {ex.Message}");
                    return false;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al enviar email: {ex.Message}");
                    return false;
                }
            }
        }
    }
}