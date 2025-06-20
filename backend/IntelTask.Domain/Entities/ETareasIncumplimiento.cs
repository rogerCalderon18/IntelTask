using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IntelTask.Domain.Entities
{
    public class ETareasIncumplimiento
    {
        [Key]
        public int CN_Id_tarea_incumplimiento { get; set; }
        public int CN_Id_tarea { get; set; }
        public string? CT_Justificacion_incumplimiento { get; set; }
        public DateTime CF_Fecha_incumplimiento { get; set; }

        [ForeignKey("CN_Id_tarea")]
        public ETareas? Tarea { get; set; }
    }
}
