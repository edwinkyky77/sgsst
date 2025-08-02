using System.Threading.Tasks;

namespace sgsst.Server.Services.Notifications
{
    // Interfaz para el servicio de envío de mensajes (puede ser Email o WhatsApp)
    public interface IMessageSender
    {
        // Este método debe coincidir exactamente con el implementado en WhatsAppSender y EmailSender
        Task SendAsync(string recipient, string subject, string message);
    }
}
