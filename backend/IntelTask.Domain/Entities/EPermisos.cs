using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class EPermisos
    {
        [Key]
        public int CN_Id_permiso { get; set; }
        public string? CT_Titulo_permiso { get; set; }
        public string CT_Descripcion_permiso { get; set; } = string.Empty;
        public byte CN_Id_estado { get; set; }
        public string? CT_Descripcion_rechazo { get; set; }
        public DateTime CF_Fecha_hora_registro { get; set; }
        public DateTime CF_Fecha_hora_inicio_permiso { get; set; }
        public DateTime CF_Fecha_hora_fin_permiso { get; set; }
        public int CN_Usuario_creador { get; set; }

        // Relaciones de navegación
        [ForeignKey("CN_Id_estado")]
        public virtual EEstados? Estado { get; set; }

        [ForeignKey("CN_Usuario_creador")]
        public virtual EUsuarios? UsuarioCreador { get; set; }
    }
}
