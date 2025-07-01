using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class EAdjuntosXPermisos
    {
        public int CN_Id_adjuntos { get; set; }
        public int CN_Id_permiso { get; set; }

        // Relaciones de navegación
        [ForeignKey("CN_Id_adjuntos")]
        public virtual EAdjuntos? Adjunto { get; set; }

        [ForeignKey("CN_Id_permiso")]
        public virtual EPermisos? Permiso { get; set; }
    }
}
