namespace IntelTask.Domain.DTOs;

public class TareaUpdateRequest
{
    public string CT_Titulo_tarea { get; set; } = string.Empty;
    public string CT_Descripcion_tarea { get; set; } = string.Empty;
    public string? CT_Descripcion_espera { get; set; }
    public byte CN_Id_complejidad { get; set; }
    public byte CN_Id_prioridad { get; set; }
    public byte CN_Id_estado { get; set; }
    public DateTime CF_Fecha_limite { get; set; }
    public string? CN_Numero_GIS { get; set; }
    public int? CN_Usuario_asignado { get; set; }
    public int CN_Usuario_editor { get; set; } // Nuevo campo para bitácora
}
