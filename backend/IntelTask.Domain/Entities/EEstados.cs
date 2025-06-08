using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    public class EEstados
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public byte CN_Id_estado { get; set; }
        public string CT_Estado { get; set; } = string.Empty;
        public string? CT_Descripcion { get; set; } = string.Empty;
    }
}