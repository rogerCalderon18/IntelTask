namespace IntelTask.Domain.DTOs
{
    public class NotificacionEmailRequest
    {
        public required string CT_Email_destino { get; set; }
        public required string CT_Asunto { get; set; }
        public required string CT_Titulo { get; set; }
        public required string CT_Tipo_notificacion { get; set; } 
        public Dictionary<string, string> Campos { get; set; } = new Dictionary<string, string>();
        public string? CT_Mensaje_adicional { get; set; }
    }
}