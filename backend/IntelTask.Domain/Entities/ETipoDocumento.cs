using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntelTask.Domain.Entities
{
    [Table("T_Tipos_documentos")]
    public class ETiposDocumentos
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CN_Id_tipo_documento { get; set; }
        public string CT_Nombre_tipo_documento { get; set; } = string.Empty;
    }
}
