using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json; // For JSON serialization
using Microsoft.Extensions.Logging; // For logging

namespace sgsst.Server.Services.Notifications
{
    // ¡IMPORTANTE! La definición de IMessageSender ha sido ELIMINADA de aquí.
    // Asegúrate de que IMessageSender esté definida en su propio archivo (ej. IMessageSender.cs)
    // en este mismo namespace (sgsst.Server.Services.Notifications).

    public class WhatsAppSender : IMessageSender
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WhatsAppSender> _logger; // Inyección de logger

        // Constructor que recibe HttpClient e IConfiguration a través de la inyección de dependencias
        public WhatsAppSender(IConfiguration configuration, HttpClient httpClient, ILogger<WhatsAppSender> logger)
        {
            _configuration = configuration;
            _httpClient = httpClient;
            _logger = logger;
            // Opcional: Configurar la URL base de la API de WhatsApp aquí si es fija
            // _httpClient.BaseAddress = new Uri(_configuration["WhatsAppApi:BaseUrl"]);
        }

        public async Task SendAsync(string recipient, string subject, string message)
        {
            _logger.LogInformation("Attempting to send WhatsApp message to {Recipient} with subject: {Subject}", recipient, subject);

            var whatsappApiUrl = _configuration["WhatsAppApi:Url"]; // URL de la API de WhatsApp
            var whatsappApiKey = _configuration["WhatsAppApi:ApiKey"]; // Clave de API
            var whatsappSenderId = _configuration["WhatsAppApi:SenderId"]; // ID del remitente (ej. número de teléfono)

            if (string.IsNullOrEmpty(whatsappApiUrl) || string.IsNullOrEmpty(whatsappApiKey) || string.IsNullOrEmpty(whatsappSenderId))
            {
                _logger.LogError("WhatsApp API configuration missing. Please check appsettings.json for 'WhatsAppApi:Url', 'WhatsAppApi:ApiKey', and 'WhatsAppApi:SenderId'.");
                throw new InvalidOperationException("WhatsApp API configuration is incomplete.");
            }

            try
            {
                // Construir el cuerpo de la petición JSON para la API de WhatsApp
                // Este formato puede variar según la API de WhatsApp que estés utilizando (ej. Twilio, Meta Business API, etc.)
                var requestBody = new
                {
                    to = recipient,
                    from = whatsappSenderId,
                    body = message,
                    // subject = subject // Algunas APIs pueden no usar un "subject" para WhatsApp
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json"
                );

                // Añadir el encabezado de autorización (si la API lo requiere)
                _httpClient.DefaultRequestHeaders.Clear(); // Limpiar encabezados previos
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {whatsappApiKey}"); // Ejemplo: Token Bearer
                // O si es una clave directa: _httpClient.DefaultRequestHeaders.Add("X-API-Key", whatsappApiKey);

                // Realizar la petición POST a la API de WhatsApp
                var response = await _httpClient.PostAsync(whatsappApiUrl, jsonContent);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("WhatsApp message sent successfully to {Recipient}.", recipient);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to send WhatsApp message to {Recipient}. Status Code: {StatusCode}. Response: {ErrorContent}",
                                     recipient, response.StatusCode, errorContent);
                    throw new HttpRequestException($"Failed to send WhatsApp message. Status: {response.StatusCode}, Response: {errorContent}");
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request error when sending WhatsApp message to {Recipient}.", recipient);
                throw new InvalidOperationException($"Error de red al enviar mensaje de WhatsApp: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred while sending WhatsApp message to {Recipient}.", recipient);
                throw new InvalidOperationException($"Error inesperado al enviar mensaje de WhatsApp: {ex.Message}", ex);
            }
        }
    }
}
