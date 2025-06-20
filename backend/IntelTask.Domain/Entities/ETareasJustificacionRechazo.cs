using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IntelTask.Domain.Entities
{
    public class ETareasJustificacionRechazo
    {
        [Key]
        public int CN_Id_tarea_rechazo { get; set; }
        public int CN_Id_tarea { get; set; }
        public DateTime CF_Fecha_hora_rechazo { get; set; }
        public string CT_Descripcion_rechazo { get; set; } = string.Empty;

        [ForeignKey("CN_Id_tarea")]
        public ETareas? Tarea { get; set; }
    }
}
