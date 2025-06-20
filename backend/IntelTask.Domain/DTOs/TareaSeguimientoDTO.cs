namespace IntelTask.Domain.DTOs
{
    public class TareaSeguimientoRequest
    {
        public int CN_Id_tarea { get; set; }
        public string? CT_Comentario { get; set; }
    }

    public class TareaSeguimientoResponse
    {
        public int CN_Id_seguimiento { get; set; }
        public int CN_Id_tarea { get; set; }
        public string? CT_Comentario { get; set; }
        public DateTime CF_Fecha_seguimiento { get; set; }
    }
}
