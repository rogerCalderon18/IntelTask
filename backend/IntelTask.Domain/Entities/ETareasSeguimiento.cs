using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IntelTask.Domain.Entities
{
    public class ETareasSeguimiento
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_seguimiento { get; set; }
        public int CN_Id_tarea { get; set; }
        public string CT_Comentario { get; set; } = string.Empty;
        public DateTime CF_Fecha_seguimiento { get; set; }

        // Relación con Tarea (opcional, para navegación)
        [ForeignKey("CN_Id_tarea")]
        public ETareas? Tarea { get; set; }
    }
}
