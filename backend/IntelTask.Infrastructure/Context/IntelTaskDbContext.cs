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
          public DbSet<EAdjuntos> T_Adjuntos { get; set; }
          public DbSet<EAdjuntosXTareas> T_Adjuntos_X_Tareas { get; set; }
          public DbSet<EBitacoraCambioEstado> T_Bitacora_Cambio_Estado { get; set; }
          public DbSet<ETiposDocumentos> T_Tipos_documentos { get; set; }
          public DbSet<EUsuarioXOficina> TI_Usuario_X_Oficina { get; set; }
          public DbSet<ETareasSeguimiento> T_Tareas_Seguimiento { get; set; }
          public DbSet<ETareasIncumplimiento> T_Tareas_Incumplimientos { get; set; }
          public DbSet<ETareasJustificacionRechazo> T_Tareas_Justificacion_Rechazo { get; set; }


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
                    
               modelBuilder.Entity<EAdjuntos>().ToTable("T_Adjuntos")
                    .HasKey(e => e.CN_Id_adjuntos);
                    
               modelBuilder.Entity<EAdjuntosXTareas>().ToTable("T_Adjuntos_X_Tareas")
                    .HasKey(e => new { e.CN_Id_adjuntos, e.CN_Id_tarea });
                    
               modelBuilder.Entity<EBitacoraCambioEstado>().ToTable("T_Bitacora_Cambios_Estados")
                    .HasKey(e => e.CN_Id_cambio_estado);

               modelBuilder.Entity<ETiposDocumentos>().ToTable("T_Tipos_documentos")
                    .HasKey(e => e.CN_Id_tipo_documento);

               modelBuilder.Entity<EUsuarioXOficina>().ToTable("TI_Usuario_X_Oficina")
                    .HasKey(e => new { e.CN_Id_usuario, e.CN_Codigo_oficina });

               modelBuilder.Entity<ETareasSeguimiento>().ToTable("T_Tareas_Seguimiento")
                    .HasKey(e => new { e.CN_Id_seguimiento, e.CN_Id_tarea });

               modelBuilder.Entity<ETareasIncumplimiento>().ToTable("T_Tareas_Incumplimientos")
                    .HasKey(e => new { e.CN_Id_tarea_incumplimiento, e.CN_Id_tarea });
              
               modelBuilder.Entity<ETareasJustificacionRechazo>().ToTable("T_Tareas_Justificacion_Rechazo")
                    .HasKey(e => new { e.CN_Id_tarea_rechazo, e.CN_Id_tarea });
          }
     }
}
