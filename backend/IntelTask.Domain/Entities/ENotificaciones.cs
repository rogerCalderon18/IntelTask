using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class ENotificaciones
    {
        [Key]
        public int CN_Id_notificacion { get; set; }
        public string CT_Titulo_notificacion { get; set; } = string.Empty;
        public int CN_Tipo_notificacion { get; set; }
        public string CT_Correo_origen { get; set; } = string.Empty;
        public string CT_Texto_notificacion { get; set; } = string.Empty;
        public DateTime CF_Fecha_notificacion { get; set; } = DateTime.Now;
        public DateTime CF_Fecha_registro { get; set; } = DateTime.Now;
        // Navegación a la relación con usuarios
        public virtual ICollection<ENotificacionesXUsuarios> NotificacionesXUsuarios { get; set; } = new List<ENotificacionesXUsuarios>();
    }
}
