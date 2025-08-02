// Program.cs
// ¡¡VERIFICA QUE ESTOS 'USING' ESTÉN EN LA PARTE SUPERIOR DE TU ARCHIVO!!
using Microsoft.EntityFrameworkCore; // Para Entity Framework Core
using sgsst.Server.Data; // Para SgsstDbContext
using sgsst.Server.Services; // Para IAuthService y AuthService
using sgsst.Server.Services.Notifications; // Para servicios de notificación
using sgsst.Server.Services.PasswordRecovery; // Para servicios de recuperación de contraseña

// Para la configuración de autenticación JWT y el manejo de tokens
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text; // Para Encoding.UTF8

// Para inyección de dependencias con clave (Keyed Services)
using Microsoft.Extensions.DependencyInjection;

// Para el hasheo de contraseñas con BCrypt
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// ********************************************************************************
// Configuración de Servicios (Add services to the container)
// ********************************************************************************

// Habilita el uso de controladores en tu API
builder.Services.AddControllers();

// Configuración para Swagger/OpenAPI (documentación de tu API)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuración de DbContext para MySQL usando Pomelo.EntityFrameworkCore.MySql
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
}
builder.Services.AddDbContext<SgsstDbContext>(options =>
    options.UseMySql(connectionString,
        ServerVersion.AutoDetect(connectionString), // Detecta automáticamente la versión de MySQL
        mySqlOptions => mySqlOptions.EnableRetryOnFailure())); // Habilita reintentos en caso de fallos de conexión

// Registro del servicio de autenticación
builder.Services.AddScoped<IAuthService, AuthService>();

// Necesario para HttpClient en WhatsAppSender
builder.Services.AddHttpClient();

// Registro de servicios de notificación (Email y WhatsApp) usando Keyed Services
// Esto permite inyectar diferentes implementaciones de IMessageSender por un nombre clave.
builder.Services.AddKeyedScoped<IMessageSender>("whatsapp", (sp, key) =>
    new WhatsAppSender(sp.GetRequiredService<IConfiguration>(),
                       sp.GetRequiredService<HttpClient>(),
                       sp.GetRequiredService<ILogger<WhatsAppSender>>())); // ¡CORRECCIÓN AQUÍ! Inyección de ILogger

builder.Services.AddKeyedScoped<IMessageSender>("email", (sp, key) =>
    new EmailSender(sp.GetRequiredService<IConfiguration>(),
                    sp.GetRequiredService<ILogger<EmailSender>>())); // ¡CORRECCIÓN AQUÍ! Inyección de ILogger

// Registro del normalizador de números de teléfono para Colombia
builder.Services.AddScoped<IPhoneNumberNormalizer, ColombiaPhoneNumberNormalizer>();

// Registro del servicio de recuperación de contraseña
builder.Services.AddScoped<IPasswordRecoveryService, PasswordRecoveryService>();

// Configuración de la autenticación JWT (JSON Web Token)
var jwtSettings = builder.Configuration.GetSection("JwtSettings");

// Obtención del secreto JWT. Usamos el operador '!' para indicar al compilador
// que estamos seguros de que este valor no será nulo en tiempo de ejecución,
// ya que debe estar configurado en appsettings.json.
var secret = jwtSettings.GetValue<string>("Secret")!; // <-- Corrección para la advertencia de nulabilidad
var issuer = jwtSettings.GetValue<string>("Issuer");
var audience = jwtSettings.GetValue<string>("Audience");
var expirationInMinutes = jwtSettings.GetValue<int>("ExpirationInMinutes");

// Verificación de configuración crítica de JWT (opcional, pero buena práctica)
if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
{
    throw new InvalidOperationException("One or more JWT settings (Secret, Issuer, Audience) are not configured in appsettings.json.");
}

builder.Services.AddAuthentication(options =>
{
    // Define el esquema de autenticación por defecto como JWT Bearer
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    // Configuración de los parámetros de validación del token JWT
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,       // Valida el emisor del token
        ValidateAudience = true,     // Valida la audiencia del token
        ValidateLifetime = true,     // Valida la vida útil del token (expiración)
        ValidateIssuerSigningKey = true, // Valida la clave de firma del emisor

        ValidIssuer = issuer,        // El emisor válido configurado en appsettings.json
        ValidAudience = audience,    // La audiencia válida configurada en appsettings.json
        // La clave de firma del emisor, generada a partir del secreto JWT
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        ClockSkew = TimeSpan.Zero    // No permite tiempo de "desfase" en la expiración del token
    };
});

// Configuración de CORS (Cross-Origin Resource Sharing)
// Permite que tu frontend (ej. React en localhost:5173) acceda a tu API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", // Nombre de la política CORS
        builder => builder.WithOrigins("http://localhost:5173") // <-- ¡IMPORTANTE! Reemplaza con la URL de tu frontend React
                            .AllowAnyHeader()    // Permite cualquier tipo de encabezado en las solicitudes
                            .AllowAnyMethod()    // Permite cualquier método HTTP (GET, POST, PUT, DELETE, etc.)
                            .AllowCredentials()); // Permite el envío de credenciales (cookies, encabezados de autorización)
});


// ********************************************************************************
// Configuración del Pipeline de Solicitudes HTTP (HTTP request pipeline)
// ********************************************************************************

var app = builder.Build();

// Configuración específica para el entorno de desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();    // Habilita el middleware de Swagger
    app.UseSwaggerUI();  // Habilita la interfaz de usuario de Swagger
}

app.UseHttpsRedirection();

// Usa la política CORS definida (debe ir antes de UseAuthentication/UseAuthorization)
app.UseCors("AllowSpecificOrigin");

// Habilita la autenticación (debe ir antes de UseAuthorization)
app.UseAuthentication();
// Habilita la autorización (permisos basados en roles/políticas)
app.UseAuthorization();

// Mapea los controladores a las rutas de la API
app.MapControllers();

// ********************************************************************************
// Seeding de Datos (Población inicial de la base de datos)
// ********************************************************************************
// Este bloque se ejecuta una vez al inicio de la aplicación para aplicar migraciones
// y crear usuarios de prueba si la base de datos está vacía.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<SgsstDbContext>();
        context.Database.Migrate(); // Aplica las migraciones pendientes a la base de datos

        // Crea usuarios de prueba solo si no existen usuarios en la tabla 'usuarios'
        if (!context.Users.Any())
        {
            // Usuario Superusuario
            var testUser = new sgsst.Server.Models.User
            {
                Nombres = "Administrador Principal",
                Alias = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"), // Contraseña hasheada
                Email = "admin@sgsst.com",
                WhatsApp = "573001234567", // Asegúrate del formato correcto para tu normalizador
                TipoUsuario = "Superusuario" // Asegúrate de que coincida con tu columna TipoUsuario
            };
            context.Users.Add(testUser);

            // Usuario normal
            var normalUser = new sgsst.Server.Models.User
            {
                Nombres = "Usuario Normal",
                Alias = "usuario",
                Password = BCrypt.Net.BCrypt.HashPassword("usuario123"), // Contraseña hasheada
                Email = "usuario@sgsst.com",
                WhatsApp = "573109876543", // Asegúrate del formato correcto para tu normalizador
                TipoUsuario = "usuario" // Asegúrate de que coincida con tu columna TipoUsuario
            };
            context.Users.Add(normalUser);

            context.SaveChanges(); // Guarda los cambios en la base de datos
            Console.WriteLine("Usuarios de prueba 'admin' y 'usuario' creados.");
            Console.WriteLine($"Contraseña hasheada para 'admin': {testUser.Password}");
        }
    }
    catch (Exception ex)
    {
        // Si ocurre un error durante la migración o el seeding, lo registra
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al crear la base de datos o al sembrar usuarios.");
    }
}

// Inicia la aplicación web
app.Run();
