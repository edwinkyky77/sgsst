using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sgsst.Server.Data; // Asegúrate de que este namespace sea correcto
using sgsst.Server.DTOs; // Asegúrate de que este namespace sea correcto para EmpleadoDto
using sgsst.Server.Models; // Asegúrate de que este namespace sea correcto para Empleado
using System;
using System.Globalization; // Para ParseExact
using System.Linq;
using System.Threading.Tasks;

namespace sgsst.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Base route: /api/Empleados
    public class EmpleadosController : ControllerBase
    {
        private readonly SgsstDbContext _context;
        private readonly ILogger<EmpleadosController> _logger; // For logging

        public EmpleadosController(SgsstDbContext context, ILogger<EmpleadosController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Endpoint for registering a new employee
        [HttpPost("register_employee")] // Route: /api/Empleados/register_employee
        public async Task<IActionResult> RegisterEmployee([FromBody] EmpleadoDto empleadoDto)
        {
            Console.WriteLine("----------------------------------------------------");
            Console.WriteLine("Backend: Petición POST recibida en /api/Empleados/register_employee");
            _logger.LogInformation("Backend: Petición POST recibida en /api/Empleados/register_employee");

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid EmpleadoDto model received for employee registration.");
                Console.WriteLine("Backend: ModelState es inválido.");
                // Loguear los errores específicos del ModelState
                foreach (var state in ModelState)
                {
                    foreach (var error in state.Value.Errors)
                    {
                        Console.WriteLine($"Backend: Error de validación para {state.Key}: {error.ErrorMessage}");
                    }
                }
                return BadRequest(ModelState);
            }

            // Check if the associated company exists
            var companyExists = await _context.Empresas.AnyAsync(e => e.IdEmpresa == empleadoDto.IdEmpresa);
            if (!companyExists)
            {
                _logger.LogWarning("Attempted to register employee for non-existent company ID: {CompanyId}", empleadoDto.IdEmpresa);
                Console.WriteLine($"Backend: Empresa con ID {empleadoDto.IdEmpresa} no encontrada.");
                return NotFound(new { success = false, message = $"Company with ID {empleadoDto.IdEmpresa} not found." });
            }

            try
            {
                Console.WriteLine("Backend: Iniciando procesamiento de datos del empleado.");
                // Convert Base64 strings to byte arrays
                byte[] hojaDeVidaBytes = null!;
                if (!string.IsNullOrEmpty(empleadoDto.HojaDeVida))
                {
                    var base64Data = empleadoDto.HojaDeVida.Contains(",") ? empleadoDto.HojaDeVida.Split(',')[1] : empleadoDto.HojaDeVida;
                    hojaDeVidaBytes = Convert.FromBase64String(base64Data);
                    Console.WriteLine($"Backend: Hoja de Vida decodificada a {hojaDeVidaBytes.Length} bytes.");
                }
                else
                {
                    hojaDeVidaBytes = Array.Empty<byte>();
                    Console.WriteLine("Backend: Hoja de Vida vacía o nula. Usando array de bytes vacío.");
                }

                byte[] firmaEmpleadoBytes = null!;
                if (!string.IsNullOrEmpty(empleadoDto.FirmaEmpleado))
                {
                    var base64Data = empleadoDto.FirmaEmpleado.Contains(",") ? empleadoDto.FirmaEmpleado.Split(',')[1] : empleadoDto.FirmaEmpleado;
                    firmaEmpleadoBytes = Convert.FromBase64String(base64Data);
                    Console.WriteLine($"Backend: Firma decodificada a {firmaEmpleadoBytes.Length} bytes.");
                }
                else
                {
                    firmaEmpleadoBytes = Array.Empty<byte>();
                    Console.WriteLine("Backend: Firma vacía o nula. Usando array de bytes vacío.");
                }

                // --- CORRECCIÓN CLAVE AQUÍ: Cambiar el formato esperado a "yyyy-MM-dd" ---
                DateTime fechaNacimientoParsed;
                if (!DateTime.TryParseExact(empleadoDto.FechaNacimiento, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fechaNacimientoParsed))
                {
                    Console.WriteLine($"Backend: Error de formato de FechaNacimiento: {empleadoDto.FechaNacimiento}");
                    return BadRequest(new { success = false, message = "Invalid 'FechaNacimiento' format. Expected yyyy-MM-dd." });
                }

                DateTime fechaIngresoParsed;
                if (!DateTime.TryParseExact(empleadoDto.FechaIngreso, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fechaIngresoParsed))
                {
                    Console.WriteLine($"Backend: Error de formato de FechaIngreso: {empleadoDto.FechaIngreso}");
                    return BadRequest(new { success = false, message = "Invalid 'FechaIngreso' format. Expected yyyy-MM-dd." });
                }

                DateTime? fechaEgresoParsed = null;
                if (!string.IsNullOrEmpty(empleadoDto.FechaEgreso))
                {
                    DateTime parsedDate;
                    if (DateTime.TryParseExact(empleadoDto.FechaEgreso, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate))
                    {
                        fechaEgresoParsed = parsedDate;
                    }
                    else
                    {
                        Console.WriteLine($"Backend: Error de formato de FechaEgreso: {empleadoDto.FechaEgreso}");
                        return BadRequest(new { success = false, message = "Invalid 'FechaEgreso' format. Expected yyyy-MM-dd or empty." });
                    }
                }
                // --- FIN CORRECCIÓN CLAVE ---

                var empleado = new Empleado
                {
                    IdEmpresa = empleadoDto.IdEmpresa,
                    NombreCompleto = empleadoDto.NombreCompleto,
                    ApellidoCompleto = empleadoDto.ApellidoCompleto,
                    Genero = empleadoDto.Genero,
                    TipoIdentificacion = empleadoDto.TipoIdentificacion,
                    Email = empleadoDto.Email,
                    NumeroIdentificacion = empleadoDto.NumeroIdentificacion,
                    FechaNacimiento = fechaNacimientoParsed,
                    EstadoCivil = empleadoDto.EstadoCivil,
                    Nacionalidad = empleadoDto.Nacionalidad,
                    TipoSangre = empleadoDto.TipoSangre,
                    Telefono = empleadoDto.Telefono,
                    NameContact = empleadoDto.NameContact,
                    TelContacto = empleadoDto.TelContacto,
                    DireccionResidencia = empleadoDto.DireccionResidencia,
                    Barrio = empleadoDto.Barrio,
                    Cargo = empleadoDto.Cargo,
                    FechaIngreso = fechaIngresoParsed,
                    FechaEgreso = fechaEgresoParsed,
                    StateContract = empleadoDto.StateContract,
                    NivelAcademico = empleadoDto.NivelAcademico,
                    Eps = empleadoDto.Eps,
                    RegimenEps = empleadoDto.RegimenEps,
                    FondoPensiones = empleadoDto.FondoPensiones,
                    FondoCesantias = empleadoDto.FondoCesantias,
                    Observaciones = empleadoDto.Observaciones,
                    OtherCourses = empleadoDto.OtherCourses,
                    HojaDeVida = hojaDeVidaBytes,
                    FirmaEmpleado = firmaEmpleadoBytes
                };

                _context.Empleados.Add(empleado); // Add the new employee to the DbSet
                Console.WriteLine("Backend: Empleado añadido al contexto. Intentando guardar cambios en la base de datos...");
                await _context.SaveChangesAsync(); // Save changes to the database
                Console.WriteLine($"Backend: SaveChanges completado. Empleado ID: {empleado.IdEmpleado}");


                _logger.LogInformation("Employee {EmployeeName} registered successfully for Company ID {CompanyId} with Employee ID {EmployeeId}.",
                                       $"{empleado.NombreCompleto} {empleado.ApellidoCompleto}", empleado.IdEmpresa, empleado.IdEmpleado);

                return CreatedAtAction(nameof(RegisterEmployee), new { id = empleado.IdEmpleado }, new { success = true, message = "Employee registered successfully." });
            }
            catch (FormatException ex)
            {
                _logger.LogError(ex, "Base64 decoding error during employee registration.");
                Console.WriteLine($"Backend ERROR: Formato Base64 inválido: {ex.Message}");
                return BadRequest(new { success = false, message = $"Invalid Base64 format for file or signature: {ex.Message}" });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during employee registration.");
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"Backend ERROR: Error de base de datos: {innerMessage}");
                return StatusCode(500, new { success = false, message = $"Error registering employee in the database: {innerMessage}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during employee registration.");
                Console.WriteLine($"Backend ERROR: Error inesperado: {ex.Message}");
                Console.WriteLine($"Backend ERROR StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { success = false, message = $"Internal server error: {ex.Message}" });
            }
            finally
            {
                Console.WriteLine("----------------------------------------------------");
            }
        }

        // You can add other endpoints here, e.g., GetEmployeeById, UpdateEmployee, DeleteEmployee, GetEmployeesByCompanyId
    }
}
