// Services/PasswordRecovery/IPasswordRecoveryService.cs
using sgsst.Server.DTOs;
using System.Threading.Tasks;

namespace sgsst.Server.Services.PasswordRecovery
{
    public interface IPasswordRecoveryService
    {
        Task<(bool success, string message)> RequestPasswordReset(PasswordResetRequest request);
        Task<(bool success, string message)> ResetPassword(PasswordResetConfirm request);
    }
}