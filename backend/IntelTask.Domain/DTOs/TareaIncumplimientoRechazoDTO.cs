namespace IntelTask.Domain.DTOs
{
    public class TareaIncumplimientoRequest
    {
        public int CN_Id_tarea { get; set; }
        public string? CT_Justificacion_incumplimiento { get; set; }
    }

    public class TareaIncumplimientoResponse
    {
        public int CN_Id_tarea_incumplimiento { get; set; }
        public int CN_Id_tarea { get; set; }
        public string? CT_Justificacion_incumplimiento { get; set; }
        public DateTime CF_Fecha_incumplimiento { get; set; }
    }

    public class TareaJustificacionRechazoRequest
    {
        public int CN_Id_tarea { get; set; }
        public string CT_Descripcion_rechazo { get; set; } = string.Empty;
    }

    public class TareaJustificacionRechazoResponse
    {
        public int CN_Id_tarea_rechazo { get; set; }
        public int CN_Id_tarea { get; set; }
        public DateTime CF_Fecha_hora_rechazo { get; set; }
        public string CT_Descripcion_rechazo { get; set; } = string.Empty;
    }
}
