// DTOs/EmpresaDto.cs
// Esta clase representa la estructura de los datos que recibes del frontend.

namespace sgsst.Server.DTOs // <--- ¡ASEGÚRATE DE QUE ESTE NAMESPACE SEA EXACTAMENTE ESTE!
{
    public class EmpresaDto
    {
        public required string NombreEmpresa { get; set; }
        public required string NitEmpresa { get; set; }
        public required string DireccionEmpresa { get; set; }
        public required string TelefonoEmpresa { get; set; }
        public required string Email { get; set; }
        public required string? Logo { get; set; }
        public required string ContactoGerente { get; set; }
        public required string Departamento { get; set; }
        public required string Municipio { get; set; }
        public required string NombreGerente { get; set; }
        public required string NombreProyecto { get; set; }
        public required string DireccionProyecto { get; set; }
        public required string SisoJefe { get; set; }
        public required string EmpresaCol { get; set; }
    }
}