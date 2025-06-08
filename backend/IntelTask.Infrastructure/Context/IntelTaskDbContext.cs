using IntelTask.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IntelTask.Infrastructure.Context
{
    public class IntelTaskDbContext : DbContext
    {
        public IntelTaskDbContext(DbContextOptions<IntelTaskDbContext> options)
            : base(options)
        {
        }

        public DbSet<EEstados> T_Estados { get; set; }
        public DbSet<EAcciones> T_Acciones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EEstados>().ToTable("T_Estados")
                 .HasKey(e => e.CN_Id_estado);

            modelBuilder.Entity<EAcciones>().ToTable("T_Acciones")
                 .HasKey(a => a.CN_Id_accion);
        }
    }
}
  