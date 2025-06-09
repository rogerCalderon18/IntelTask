using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities

{
    public class EOficinas
    {
        [Key]
        public int CN_Codigo_oficina { get; set; }
        public string CT_Nombre_oficina { get; set; } = string.Empty;
        public int? CN_Oficina_encargada { get; set; }
    }
}
