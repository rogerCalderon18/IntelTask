using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities

{
    public class ERoles
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_rol { get; set; }
        public string CT_Nombre_rol { get; set; } = string.Empty;

        public int CN_Jerarquia { get; set; }

    }
}
