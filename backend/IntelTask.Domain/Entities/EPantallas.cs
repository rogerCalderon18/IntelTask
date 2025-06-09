using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities

{
    public class EPantallas
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_pantalla { get; set; }
        public string CT_Descripcion { get; set; } = string.Empty;

    }
}
