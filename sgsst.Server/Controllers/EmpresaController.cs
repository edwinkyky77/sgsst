using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sgsst.Server.Data; // Asegúrate de que este namespace sea correcto
using sgsst.Server.DTOs; // Asegúrate de que este namespace sea correcto
using sgsst.Server.Models; // Asegúrate de que este namespace sea correcto
using System.Linq;
using System.Threading.Tasks;

namespace sgsst.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ruta base: /api/Empresas
    public class EmpresasController : ControllerBase
    {
        private readonly SgsstDbContext _context;
        private readonly ILogger<EmpresasController> _logger; // Para logging

        public EmpresasController(SgsstDbContext context, ILogger<EmpresasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Endpoint para registrar una nueva empresa
        [HttpPost("register_company")] // Ruta: /api/Empresas/register_company
        public async Task<IActionResult> RegisterCompany([FromBody] EmpresaDto empresaDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Modelo de EmpresaDto inválido al registrar empresa.");
                return BadRequest(ModelState);
            }

            try
            {
                // Convertir la cadena Base64 del logo a un array de bytes
                byte[]? logoBytes = null;
                if (!string.IsNullOrEmpty(empresaDto.Logo))
                {
                    // Eliminar el prefijo "data:image/png;base64," si existe
                    var base64Data = empresaDto.Logo.Contains(",") ? empresaDto.Logo.Split(',')[1] : empresaDto.Logo;
                    logoBytes = Convert.FromBase64String(base64Data);
                }
                else
                {
                    // Si el logo es nulo o vacío, asigna un array de bytes vacío
                    // Esto es necesario si la columna 'logo' en la DB es NOT NULL
                    logoBytes = Array.Empty<byte>();
                }

                var empresa = new Empresa
                {
                    NombreEmpresa = empresaDto.NombreEmpresa,
                    NitEmpresa = empresaDto.NitEmpresa,
                    DireccionEmpresa = empresaDto.DireccionEmpresa,
                    TelefonoEmpresa = empresaDto.TelefonoEmpresa,
                    Email = empresaDto.Email,
                    Logo = logoBytes, // Asigna los bytes del logo
                    ContactoGerente = empresaDto.ContactoGerente,
                    Departamento = empresaDto.Departamento,
                    Municipio = empresaDto.Municipio,
                    NombreGerente = empresaDto.NombreGerente,
                    NombreProyecto = empresaDto.NombreProyecto,
                    DireccionProyecto = empresaDto.DireccionProyecto,
                    SisoJefe = empresaDto.SisoJefe,
                    EmpresaCol = empresaDto.EmpresaCol
                };

                _context.Empresas.Add(empresa);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Empresa {NombreEmpresa} registrada exitosamente con ID {IdEmpresa}.", empresa.NombreEmpresa, empresa.IdEmpresa);
                return CreatedAtAction(nameof(GetCompanies), new { id = empresa.IdEmpresa }, new { success = true, message = "Empresa registrada exitosamente." });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Error de base de datos al registrar empresa.");
                // Intenta extraer un mensaje de error más específico de la excepción interna
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new { success = false, message = $"Error al registrar la empresa en la base de datos: {innerMessage}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al registrar empresa.");
                return StatusCode(500, new { success = false, message = $"Error interno del servidor: {ex.Message}" });
            }
        }

        // ¡NUEVO ENDPOINT! Para obtener la lista de empresas
        [HttpGet] // Ruta: /api/Empresas
        public async Task<ActionResult<IEnumerable<EmpresaListDto>>> GetCompanies()
        {
            try
            {
                var empresas = await _context.Empresas
                                             .Select(e => new EmpresaListDto
                                             {
                                                 IdEmpresa = e.IdEmpresa,
                                                 NombreEmpresa = e.NombreEmpresa,
                                                 NitEmpresa = e.NitEmpresa,
                                                 LogoBase64 = e.Logo != null && e.Logo.Length > 0 ? Convert.ToBase64String(e.Logo) : null // Convertir byte[] a Base64
                                             })
                                             .ToListAsync();

                _logger.LogInformation("Se recuperaron {Count} empresas de la base de datos.", empresas.Count);
                return Ok(empresas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ERROR: Excepción al obtener lista de empresas.");
                return StatusCode(500, new { success = false, message = $"Error al obtener las empresas: {ex.Message}" });
            }
        }
    }
}
