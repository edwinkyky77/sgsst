// sgsst.Server/Services/Notifications/IMessageSender.cs
namespace sgsst.Server.Services.Notifications
{
    public interface IMessageSender
    {
        Task<bool> SendMessage(string destination, string message);
    }
}