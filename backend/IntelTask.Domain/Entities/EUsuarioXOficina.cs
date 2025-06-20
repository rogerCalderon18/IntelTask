using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class EUsuarioXOficina
    {
        public int CN_Id_usuario { get; set; }
        public int CN_Codigo_oficina { get; set; }

        // Relaciones de navegación
        [ForeignKey("CN_Id_usuario")]
        public virtual EUsuarios? Usuario { get; set; }

        [ForeignKey("CN_Codigo_oficina")]
        public virtual EOficinas? Oficina { get; set; }
    }
}
