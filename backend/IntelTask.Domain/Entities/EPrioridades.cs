using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities

{
    public class EPrioridades
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public byte CN_Id_prioridad { get; set; }
        public string CT_Nombre_prioridad { get; set; } = string.Empty;
        public string CT_Descripcion_prioridad { get; set; } = string.Empty;
    }
}
