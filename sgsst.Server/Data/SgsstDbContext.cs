// Data/SgsstDbContext.cs
// Contexto de base de datos para Entity Framework Core.

using Microsoft.EntityFrameworkCore;
using sgsst.Server.Models; // Asegúrate de que este namespace sea correcto para tus entidades User, PasswordResetToken y Empresa

namespace sgsst.Server.Data // Reemplaza 'sgsst.Server.Data' si tu namespace es diferente
{
    public class SgsstDbContext : DbContext
    {
        public SgsstDbContext(DbContextOptions<SgsstDbContext> options) : base(options)
        {
        }

        // DbSets existentes para User y PasswordResetToken
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

        // ¡NUEVO! DbSet para tu tabla 'empresa'
        public DbSet<Empresa> Empresas { get; set; } = null!; // Añade esta línea

        // ¡NUEVO! DbSet para tu tabla 'empleado'
        public DbSet<Empleado> Empleados { get; set; } = null!; // Añade esta línea para la tabla de empleados

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales del modelo, si las hay (ej. índices únicos para Alias)
            // modelBuilder.Entity<User>().HasIndex(u => u.Alias).IsUnique();

            // Configuración de la relación entre User y PasswordResetToken
            modelBuilder.Entity<PasswordResetToken>()
                .HasOne(prt => prt.User)
                .WithMany()
                .HasForeignKey(prt => prt.UserId);

            // Configuración de la relación entre Empleado y Empresa (Foreign Key)
            modelBuilder.Entity<Empleado>()
                .HasOne(e => e.Empresa) // Un empleado tiene una empresa
                .WithMany() // Una empresa puede tener muchos empleados (o no se mapea la colección inversa)
                .HasForeignKey(e => e.IdEmpresa) // La clave foránea en la tabla Empleado
                .OnDelete(DeleteBehavior.Restrict); // Opcional: define el comportamiento al borrar la empresa (Restrict, Cascade, SetNull)
                                                    // Restrict es una buena opción para evitar borrados accidentales de empresas con empleados asociados.


            // Asegurar que las cadenas vacías no se inserten como NULL en MySQL para varchar(45) NOT NULL
            // Esto es más común con MySql.Data, pero es una buena práctica defensiva.
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.IsColumnNullable() == false && property.ClrType == typeof(string))
                    {
                        property.SetDefaultValueSql("''");
                    }
                }
            }
        }
    }
}
