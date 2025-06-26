// Services/Notifications/IPhoneNumberNormalizer.cs
// Esto es para asegurar que los números de teléfono estén en un formato estándar (ej. +57310xxxxxxx)
namespace sgsst.Server.Services.Notifications
{
    public interface IPhoneNumberNormalizer
    {
        string Normalize(string phoneNumber);
    }

    public class ColombiaPhoneNumberNormalizer : IPhoneNumberNormalizer
    {
        public string Normalize(string phoneNumber)
        {
            // Ejemplo de normalización para Colombia
            // Asegura que el número empiece con +57 y tenga 10 dígitos (sin el 0 o 300 inicial)
            if (string.IsNullOrWhiteSpace(phoneNumber)) return string.Empty;

            phoneNumber = phoneNumber.Trim()
                                     .Replace(" ", "")
                                     .Replace("-", "");

            if (phoneNumber.StartsWith("+57"))
            {
                return phoneNumber;
            }
            else if (phoneNumber.StartsWith("3") && phoneNumber.Length == 10) // Asume 3xx xxx xxxx
            {
                return "+57" + phoneNumber;
            }
            else if (phoneNumber.StartsWith("03") && phoneNumber.Length == 12) // Asume 03X xxx xxxx
            {
                return "+57" + phoneNumber.Substring(2);
            }
            // Agrega más lógica de normalización según tus necesidades
            return "+57" + phoneNumber; // Fallback, no ideal
        }
    }
}