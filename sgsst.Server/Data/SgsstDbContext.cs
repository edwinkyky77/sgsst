// Data/SgsstDbContext.cs
using Microsoft.EntityFrameworkCore;
using sgsst.Server.Models;

namespace sgsst.Server.Data
{
    // ¡CORREGIDO! Nombre de la clase SgsstDbContext
    public class SgsstDbContext : DbContext
    {
        public SgsstDbContext(DbContextOptions<SgsstDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

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