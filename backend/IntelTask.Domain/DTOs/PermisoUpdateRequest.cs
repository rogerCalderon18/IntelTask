using System;

namespace IntelTask.Domain.DTOs
{
    public class PermisoUpdateRequest
    {
        public string? CT_Titulo_permiso { get; set; }
        public string CT_Descripcion_permiso { get; set; } = string.Empty;
        public byte CN_Id_estado { get; set; }
        public string? CT_Descripcion_rechazo { get; set; }
        public DateTime CF_Fecha_hora_inicio_permiso { get; set; }
        public DateTime CF_Fecha_hora_fin_permiso { get; set; }
        public int CN_Usuario_editor { get; set; }
    }
}
