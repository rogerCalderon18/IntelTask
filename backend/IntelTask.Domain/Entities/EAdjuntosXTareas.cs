using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class EAdjuntosXTareas
    {
        public int CN_Id_adjuntos { get; set; }
        
        public int CN_Id_tarea { get; set; }

        // Navegación
        [ForeignKey("CN_Id_adjuntos")]
        public virtual EAdjuntos? Adjunto { get; set; }

        [ForeignKey("CN_Id_tarea")]
        public virtual ETareas? Tarea { get; set; }
    }
}
