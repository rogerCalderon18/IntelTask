using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities

{
    public class EComplejidades
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public byte CN_Id_complejidad { get; set; }
        public string CT_Nombre { get; set; } = string.Empty;
    }
}
