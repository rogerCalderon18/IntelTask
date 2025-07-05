using System;

namespace IntelTask.Domain.DTOs
{
    public class TareaRequest
    {
        // Campos requeridos
        public string CT_Titulo_tarea { get; set; } = string.Empty;
        public string CT_Descripcion_tarea { get; set; } = string.Empty;
        public string? CT_Descripcion_espera { get; set; }
        public byte CN_Id_complejidad { get; set; }
        public byte CN_Id_prioridad { get; set; }
        public byte CN_Id_estado { get; set; }
        public DateTime CF_Fecha_limite { get; set; }
        public int CN_Usuario_creador { get; set; }
          // Campos opcionales
        public int? CN_Tarea_origen { get; set; }
        public string? CN_Numero_GIS { get; set; }
        public int? CN_Usuario_asignado { get; set; }
    }
}
