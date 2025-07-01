using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class ENotificacionesXUsuarios
    {
        public int CN_Id_notificacion { get; set; }
        public int CN_Id_usuario { get; set; }
        public string CT_Correo_destino { get; set; } = string.Empty;
        // Relaciones de navegación
        [ForeignKey("CN_Id_notificacion")]
        public virtual ENotificaciones? Notificacion { get; set; }
        [ForeignKey("CN_Id_usuario")]
        public virtual EUsuarios? Usuario { get; set; }
    }
}
