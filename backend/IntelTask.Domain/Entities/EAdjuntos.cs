using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace IntelTask.Domain.Entities
{
    public class EAdjuntos
    {
        [Key]
        public int CN_Id_adjuntos { get; set; }

        [Column("CT_Archivo_ruta")]
        [StringLength(250)]
        public string CT_Archivo_ruta { get; set; } = string.Empty;

        public int CN_Usuario_accion { get; set; }

        public DateTime CF_Fecha_registro { get; set; } = DateTime.Now;

        // Navegación
        public virtual ICollection<EAdjuntosXTareas> AdjuntosXTareas { get; set; } = new List<EAdjuntosXTareas>();
    }
}
