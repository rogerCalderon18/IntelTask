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
          public DbSet<EPantallas> T_Pantallas { get; set; }
          public DbSet<ERoles> T_Roles { get; set; }
          public DbSet<EPrioridades> T_Prioridades { get; set; }
          public DbSet<EComplejidades> T_Complejidades { get; set; }
          public DbSet<EOficinas> T_Oficinas { get; set; }
          public DbSet<EDiasNoHabiles> T_Dias_No_Habiles { get; set; }
          public DbSet<EUsuarios> T_Usuarios { get; set; }
          public DbSet<ETareas> T_Tareas { get; set; }


          protected override void OnModelCreating(ModelBuilder modelBuilder)
          {
               modelBuilder.Entity<EEstados>().ToTable("T_Estados")
                    .HasKey(e => e.CN_Id_estado);

               modelBuilder.Entity<EAcciones>().ToTable("T_Acciones")
                    .HasKey(e => e.CN_Id_accion);

               modelBuilder.Entity<EPantallas>().ToTable("T_Pantallas")
                    .HasKey(e => e.CN_Id_pantalla);

               modelBuilder.Entity<ERoles>().ToTable("T_Roles")
                    .HasKey(e => e.CN_Id_rol);

               modelBuilder.Entity<EPrioridades>().ToTable("T_Prioridades")
                    .HasKey(e => e.CN_Id_prioridad);

               modelBuilder.Entity<EComplejidades>().ToTable("T_Complejidades")
                    .HasKey(e => e.CN_Id_complejidad);

               modelBuilder.Entity<EOficinas>().ToTable("T_Oficinas")
                    .HasKey(e => e.CN_Codigo_oficina);

               modelBuilder.Entity<EDiasNoHabiles>().ToTable("T_Dias_No_Habiles")
                    .HasKey(e => e.CN_Id_dias_no_habiles);

               modelBuilder.Entity<EUsuarios>().ToTable("T_Usuarios")
                    .HasKey(e => e.CN_Id_usuario);
                    
               modelBuilder.Entity<ETareas>().ToTable("T_Tareas")
                    .HasKey(e => e.CN_Id_tarea);
          }
     }
}
