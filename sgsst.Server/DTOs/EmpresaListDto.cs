// DTOs/EmpresaListDto.cs
// Esta clase representa la estructura de los datos que se envían al frontend
// cuando se solicita una lista de empresas (ej. para CompanyList.tsx).

namespace sgsst.Server.DTOs // Reemplaza 'sgsst.Server.DTOs' con el namespace de tu proyecto
{
    public class EmpresaListDto
    {
        public int IdEmpresa { get; set; }
        public required string NombreEmpresa { get; set; }
        public required string NitEmpresa { get; set; }
        public required string? LogoBase64 { get; set; } // El logo se envía como una cadena Base64
    }
}
