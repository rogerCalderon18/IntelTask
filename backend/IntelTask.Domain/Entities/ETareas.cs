using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class ETareas
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_tarea { get; set; }
        public int? CN_Tarea_origen { get; set; }
        public string CT_Titulo_tarea { get; set; } = string.Empty;
        public string CT_Descripcion_tarea { get; set; } = string.Empty;
        public string? CT_Descripcion_espera { get; set; }
        public byte CN_Id_complejidad { get; set; }
        public byte CN_Id_estado { get; set; }
        public byte CN_Id_prioridad { get; set; }
        public string? CN_Numero_GIS { get; set; }
        public DateTime CF_Fecha_asignacion { get; set; }
        public DateTime CF_Fecha_limite { get; set; }
        public DateTime? CF_Fecha_finalizacion { get; set; }
        public int CN_Usuario_creador { get; set; }
        public int? CN_Usuario_asignado { get; set; }

        // Relaciones de navegación
        [ForeignKey("CN_Id_complejidad")]
        public virtual EComplejidades? Complejidad { get; set; }

        [ForeignKey("CN_Id_estado")]
        public virtual EEstados? Estado { get; set; }

        [ForeignKey("CN_Id_prioridad")]
        public virtual EPrioridades? Prioridad { get; set; }

        // Relaciones de navegación adicionales
        [ForeignKey("CN_Tarea_origen")]
        public virtual ETareas? TareaOrigen { get; set; }
        [ForeignKey("CN_Usuario_creador")]
        public virtual EUsuarios? UsuarioCreador { get; set; }
        [ForeignKey("CN_Usuario_asignado")]
        public virtual EUsuarios? UsuarioAsignado { get; set; }

    }
}