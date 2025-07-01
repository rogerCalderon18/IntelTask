using System;

namespace IntelTask.Domain.DTOs
{
    public class PermisoRequest
    {
        // Campos requeridos
        public string? CT_Titulo_permiso { get; set; }
        public string CT_Descripcion_permiso { get; set; } = string.Empty;
        public DateTime CF_Fecha_hora_inicio_permiso { get; set; }
        public DateTime CF_Fecha_hora_fin_permiso { get; set; }
        public int CN_Usuario_creador { get; set; }
    }
}
